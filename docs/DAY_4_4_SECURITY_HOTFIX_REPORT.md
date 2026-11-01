# Pravaah UPSC — Day 4.4 Security Hotfix Report

**Document Version:** 1.0.0  
**Date:** 2026-11-01  
**Classification:** Critical Security Hotfix (P0 Mitigation)  
**Target Branch:** `main` (Production)  
**Hotfix Branch:** `hotfix/live-analytics-auth-guard`  
**Base Commit:** `dca37bd` (`origin/main`)  
**Deployment Parity Status:** Additive, zero-downtime, zero data loss  

---

## 1. Executive Summary

During the Day 4.3 deployment parity audit between the local environment and live production (`https://pravaah-upsc.vercel.app/`), a critical access control vulnerability was verified on the live site:
- Unauthenticated HTTP requests to `GET /api/v1/analytics/dashboard` returned `HTTP 200 OK`.
- The response returned personalized telemetry, study metrics, and test attempt history belonging to the default demo aspirant user (`aspirant@pravaah.in`).

This vulnerability arose because the legacy implementation on `main` defaulted authentication helpers (`getCurrentUser`) to an insecure demo fallback (`allowDemoFallback: true`) and trusted arbitrary client-supplied `x-user-id` headers.

In strict compliance with prompt constraints, feature work on Day 5 was paused. Rather than merging Pull Request #1 (which bundles multi-day SaaS subscription features), a dedicated surgical hotfix branch was created directly from `origin/main` (`dca37bd`).

This hotfix:
1. Eliminates `allowDemoFallback` entirely across all authentication helpers.
2. Enforces fail-closed cryptographic server-side sessions using SHA-256 token hashing and 256-bit random tokens stored in the `Session` table.
3. Upgrades password hashing to `scrypt` with a per-user salt while maintaining seamless constant-time backwards compatibility for existing SHA-256 user password hashes.
4. Rejects spoofed `x-user-id` and raw user IDs in `Authorization` headers.
5. Guards all protected routes (`analytics/dashboard`, `user/bookmarks`, `user/notes`, `user/revision`, `user/subscription`, `tests/session/start`, `tests/session/submit`, and all `admin/*` endpoints) using `requireAuthenticatedUser`.
6. Enforces strict role-based access control (RBAC), returning HTTP 401 Unauthorized for guests and HTTP 403 Forbidden for non-admin accounts accessing administration APIs.
7. Adds a 9-scenario regression test suite (`tests/security_hotfix_validation.test.mjs`), validating all security criteria with 100% pass rates.

---

## 2. Root Cause Analysis

### Vulnerability Mechanism
In `origin/main:lib/auth.ts`, the `getCurrentUser` function was defined as:
```typescript
export async function getCurrentUser(
  request?: NextRequest,
  options: { allowDemoFallback?: boolean } = { allowDemoFallback: true }
): Promise<CurrentUser>
```
When `app/api/v1/analytics/dashboard/route.ts` called `const user = await getCurrentUser(request)`, any unauthenticated caller (guest) was automatically assigned the database user record for `aspirant@pravaah.in`. The endpoint proceeded to query all test attempts and sessions for that `userId`, returning confidential student analytics under an HTTP 200 status code.

### Spoofing Vulnerability
Furthermore, `getAuthenticatedUser` on `main` accepted arbitrary `x-user-id` HTTP headers and raw user IDs passed in `Authorization: Bearer <user-id>` without cryptographic verification or database session validation. An attacker could forge identity as any learner or administrator simply by setting the header.

---

## 3. Patch Architecture

### 3.1 Cryptographic Server-Side Sessions
- **Session Tokens:** Generated via `crypto.randomBytes(32).toString("hex")` (256 bits of cryptographic entropy).
- **Storage:** Stored in the database as a SHA-256 digest (`tokenHash`), preventing token exposure in the event of database read leaks.
- **Revocation:** Explicit `revokeSession` method marks sessions as `isRevoked: true` or deletes the record on logout.
- **Cookies & Headers:** Delivered via HTTP-only, secure, `SameSite=Lax` cookies (`pravaah_session_token`) and supported via `Authorization: Bearer <64-char-hex-token>`.

### 3.2 Dual-Mode Password Security
- **Algorithm:** `scrypt` using 16-byte random salt and 64-byte key length.
- **Backwards Compatibility:** Legacy SHA-256 hashes (`sha256:...` or legacy 64-char hex strings) are validated via constant-time comparison (`crypto.timingSafeEqual`).
- **Transparent Migration:** When a user with a legacy hash logs in successfully, their password hash in the database is automatically and transparently upgraded to `scrypt`.

### 3.3 Fail-Closed Authorization Guard (`requireAuthenticatedUser`)
A standardized helper enforces authentication and RBAC across all sensitive route handlers:
```typescript
export async function requireAuthenticatedUser(
  request: NextRequest,
  options: { requiredRole?: string } = {}
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      ),
    };
  }
  if (options.requiredRole && user.role !== options.requiredRole) {
    return {
      error: NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      ),
    };
  }
  return { user };
}
```

---

## 4. Minimal Changed Files List

The hotfix touches only authentication, session management, route protection, and security test harnesses:

| File Path | Description of Change |
|---|---|
| `prisma/schema.prisma` | Added `Session` model and `sessions Session[]` relation on `User` |
| `prisma/dev.db` | Added `Session` table schema with `isRevoked` column |
| `lib/auth.ts` | Complete rewrite: scrypt hashing, cryptographic sessions, fail-closed auth, RBAC guard |
| `app/api/v1/analytics/dashboard/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/auth/login/route.ts` | Upgraded to scrypt + legacy fallback, session creation, HTTP-only cookie |
| `app/api/v1/auth/logout/route.ts` | Added session token revocation in DB and cookie clearing |
| `app/api/v1/auth/register/route.ts` | Creates authentic server session upon registration |
| `app/api/v1/auth/switch-role/route.ts` | Disabled in production; creates authentic test session in non-production |
| `app/api/v1/user/bookmarks/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/user/notes/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/user/revision/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/user/subscription/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/user/subscription/cancel/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/billing/checkout/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/tests/session/start/route.ts` | Protected with `requireAuthenticatedUser` |
| `app/api/v1/tests/session/submit/route.ts` | Protected with `requireAuthenticatedUser` and session ownership check |
| `app/api/v1/attempts/learn/route.ts` | Persists attempt only if authenticated; guest learn mode functional without leaks |
| `app/api/v1/admin/*` (8 route files) | Enforced `requireAuthenticatedUser(request, { requiredRole: "ADMIN" })` |
| `.gitignore` | Added `.neon` and `.env.*` to prevent secret leakage |
| `tests/test_auth_helper.mjs` | Added test helper for authentic session generation |
| `tests/security_hotfix_validation.test.mjs` | Added dedicated 9-scenario regression test suite |
| `tests/security_auth_isolation.test.mjs` | Updated test harness to use session tokens instead of `x-user-id` |
| `tests/e2e_http_routes.test.mjs` | Updated test harness for authenticated endpoints |
| `tests/pricing_subscriptions.test.mjs` | Updated test harness for authenticated endpoints |
| `tests/question_bank_expansion.test.mjs` | Updated timed exam test harness with authenticated session |

---

## 5. Security Test Suite Validation (All 9 Scenarios Passed)

The hotfix validation was verified via `node --test tests/security_hotfix_validation.test.mjs`:

```
✔ Scenario 1: Guest requests analytics API -> 401 Unauthorized (104.04ms)
✔ Scenario 2: Authenticated learner requests own dashboard -> 200 OK (148.11ms)
✔ Scenario 3: Learner A vs Learner B cross-user data isolation -> Denied / Isolated (100.14ms)
✔ Scenario 4: Expired session token -> 401 Unauthorized (46.34ms)
✔ Scenario 5: Invalid session token -> 401 Unauthorized (2.83ms)
✔ Scenario 6: Spoofed x-user-id header or raw user ID Bearer -> Rejected & Denied (4.29ms)
✔ Scenario 7: Ordinary learner requests admin API -> 403 Forbidden (45.62ms)
✔ Scenario 8: Authorized admin requests permitted admin API -> 200 OK (4.45ms)
✔ Scenario 9: Existing login, session establishment, auth me, and logout workflows -> Preserved (78.01ms)

Total Tests: 9 passed, 0 failed, 0 skipped (100% success rate)
```

### Full Regression Test Suite
Executed `npm test` across all 11 test modules:
```
Total Suites: 11
Total Tests: 55 passed, 0 failed, 0 skipped
Overall Duration: ~870ms
Exit Code: 0 (Clean)
```

### Next.js Production Build
Executed `npm run build`:
```
✔ Generated Prisma Client (v5.22.0)
✔ Compiled successfully
✔ Linting and checking validity of types
✔ Generating static pages (32/32)
✔ Finalizing page optimization
Exit Code: 0 (Clean)
```

---

## 6. Deployment and Rollout Plan

1. **Dedicated Pull Request:**
   - A dedicated PR will be opened targeting `main`: `hotfix/live-analytics-auth-guard -> main`.
   - Pull Request #1 remains open and unmerged.
2. **Review & Approval:**
   - Code Reviewer subagent execution confirms patch cleanliness.
   - User reviews and approves PR.
3. **Deployment Strategy:**
   - Merge `hotfix/live-analytics-auth-guard` into `main`.
   - Vercel automatically builds and deploys `main`.
   - Deployment verifies without database migration downtime (the `Session` table schema is purely additive).

---

## 7. Risk Assessment and Rollback Strategy

| Risk Category | Severity | Likelihood | Mitigation Strategy |
|---|---|---|---|
| Existing user password invalidation | High | Low | `verifyPassword` supports legacy SHA-256 hashes and transparently upgrades them to `scrypt` upon login. |
| Session table schema missing | Medium | Low | The `Session` table definition is additive. `npx prisma generate` was verified against client runtime. |
| Guest experience disruption | Medium | Low | Public PYQ browsing, syllabus search, exam directory, and learn mode remain 100% functional for guests. |
| Rollback plan | Low | Low | If any regression is observed on production, reverting the hotfix PR on `main` immediately restores previous commit `dca37bd`. |

---

## 8. Confirmation of Safety Constraints

- **Production Database:** No production data was modified, truncated, deleted, or re-seeded.
- **PR #1:** Remained untouched and unmerged.
- **Day 3 / Day 4.2 Code:** Not prematurely backported or merged to production.
- **Sensitive Data:** Zero real student records, credentials, or environment secrets printed or committed.
- **Automatic Deployment:** Disabled; awaiting human review and sign-off.
