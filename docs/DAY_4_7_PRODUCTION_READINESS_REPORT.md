# PRAVAAH UPSC — DAY 4.7
# PRODUCTION READINESS: CODE AUDIT, ENVIRONMENT VALIDATION & SECURITY FIXES

**Author:** Senior Full-Stack Engineer, Next.js Architect & Application Security Reviewer
**Project:** Pravaah UPSC
**Repository:** [https://github.com/Aradhy20/pravaah-upsc](https://github.com/Aradhy20/pravaah-upsc)
**Target Deployment:** `https://pravaah-upsc-cb1qa17yu-aardhy-jains-projects.vercel.app/`
**Git Branch:** `hotfix/live-analytics-auth-guard`
**Git Base Commit:** `be206b9`
**Date:** November 1, 2026
**Audited By:** Antigravity AI Engineering Pair

---

## 1. Real Project State & Verification

### 1.1 Git Tracking & Remote Parity
- **Repository:** `Aradhy20/pravaah-upsc`
- **Active Branch:** `hotfix/live-analytics-auth-guard` (Confirmed: matches working tree).
- **Latest Remote Commit:** `be206b9` (`docs: add Day 4.6 new Vercel project configuration recovery report`).
- **Working Tree State:** All audited code fixes and test additions staged for owner review. Zero commits pushed pending owner approval.

### 1.2 Local Project & Vercel CLI Linkage
- **`.vercel/project.json`:** Inspected locally. Does **not** exist in the workspace.
- **Local Vercel CLI:** Installed in npm cache (v65.9.0) and confirmed in `Logged out` state (`npx vercel whoami`). No silent deployments or unauthorized API actions occurred.

### 1.3 Verified Architecture & Dependencies
- **Framework:** Next.js `14.2.35` (App Router)
- **Runtime:** Node.js `v20.20.2` LTS (target function region: `iad1`)
- **Database Engine:** PostgreSQL 18.6 (authoritative Neon Serverless PostgreSQL with connection pooling)
- **ORM:** Prisma Client `5.22.0`
- **Frontend Stack:** React `18.3.1`, Tailwind CSS `3.4.15`, Lucide Icons `0.460.0`
- **Authentication:** Custom server-side cryptographic sessions (`lib/auth.ts`) using Node `crypto` (scrypt password hashing + SHA-256 session token digests)
- **External Auth (NextAuth):** **NOT installed, NOT imported, NOT used.** `package.json` contains zero NextAuth dependencies.

---

## 2. Verified Environment Variable Inventory

Every file in `app/`, `lib/`, `prisma/`, and `tests/` was statically analyzed. The verified runtime requirements are classified below:

| Variable Name | Classification | Usage & Purpose | Source File | Required Action |
| :--- | :---: | :--- | :--- | :--- |
| **`NEON_DATABASE_URL`** | **Required at Runtime** | Primary pooled PostgreSQL connection string for Prisma Client. | `lib/prisma.ts` (L15, L37), `lib/env.ts` | Set in Vercel (Production & Preview) |
| **`DATABASE_URL`** | **Required at Build & Runtime** | Fallback connection string & Prisma query engine synchronization (`process.env["DATABASE_URL"] = dbUrl`). | `lib/prisma.ts` (L16, L38, L89), `prisma/schema.prisma` | Set in Vercel (identical to `NEON_DATABASE_URL`) |
| **`PAYMENT_WEBHOOK_SECRET`** | **Required at Runtime (Prod)** | Verifies genuine HMAC-SHA256 signature on payment webhook payloads. Fails closed (HTTP 500) if missing in prod. | `app/api/v1/billing/webhook/route.ts`, `lib/env.ts` | Set in Vercel (Generate via `openssl rand -hex 32`) |
| **`NODE_ENV`** | **Required at Runtime** | Differentiates production security guards (strict SQLite rejection, secure cookies, strict webhook HMAC). | `app/api/v1/**`, `lib/auth.ts`, `lib/prisma.ts`, `lib/env.ts` | Provided automatically by Vercel (`production`) |
| **`DATABASE_URL_UNPOOLED`** | Optional / Dev-only | Direct port 5432 connection for local interactive Prisma schema workflows. Not used by serverless runtime. | Local `.env` | Not required in Vercel |
| **`ENABLE_LOCAL_DEMO_FALLBACK`**| Development-only | Permits guest demo fallback in local dev only (`NODE_ENV === "development"`). Hard-blocked in production. | `lib/auth.ts` (L207) | **Forbidden in Vercel** |
| **`NEXT_PUBLIC_APP_NAME`** | Optional | Brand title string fallback (`Pravaah UPSC`). | `.env.example` | Optional |
| **`NEXTAUTH_SECRET`** | **Obsolete / Not Used** | Legacy template variable. The application does not use NextAuth; custom sessions are implemented via `lib/auth.ts`. | `.env.example` | Can be set as dummy or omitted |
| **`NEXTAUTH_URL`** | **Obsolete / Not Used** | Legacy template variable. | `.env.example` | Can be set as dummy or omitted |
| **`POSTGRES_PRISMA_URL`** | Optional Fallback | Automatically populated if Vercel Marketplace Storage integration is attached. | `lib/prisma.ts` (Priority 3) | Optional |
| **`POSTGRES_URL`** | Optional Fallback | Standard Vercel Postgres alias. | `lib/prisma.ts` (Priority 4) | Optional |
| **`PRISMA_DATABASE_URL`** | Optional Fallback | Standard Prisma Data Platform alias. | `lib/prisma.ts` (Priority 5) | Optional |

---

## 3. Database & Prisma Safety Findings

1. **Resolution Hierarchy:** In `lib/prisma.ts`, `NEON_DATABASE_URL` is prioritized first, falling back to `DATABASE_URL`.
2. **Production SQLite Prohibition:** `lib/prisma.ts` and `lib/env.ts` strictly reject non-Postgres protocols (`file:`) when `NODE_ENV === "production"`. Any attempt to connect to SQLite in production throws a sanitized configuration error.
3. **Serverless Connection Management Fix:** Updated `lib/prisma.ts` to assign `globalForPrisma.prisma = prisma;` unconditionally, ensuring warm serverless containers reuse the singleton client instance across function invocations.
4. **Sanitized Logs & Error Handling:** `getSanitizedUrlSummary()` strips credentials, usernames, and passwords before formatting connection summaries in logs or exceptions.
5. **No Migration at Build Time:** `package.json` defines `"build": "prisma generate && next build"`. No `prisma migrate deploy` or `prisma db push` is executed during builds, protecting production data.

---

## 4. Authentication & Session Security Findings

1. **Password Hashing:** Passwords use scrypt with 16 cryptographically random salt bytes and 64-byte derived keys (`scrypt:<salt>:<key>`).
2. **Legacy Hash Upgrade:** Passwords stored with legacy SHA-256 hashes are automatically verified with constant-time equality and upgraded to scrypt upon user login.
3. **Session Entropy & Storage:** Session tokens consist of 32 random bytes (64 hex characters, 256 bits of entropy). Only the SHA-256 hash (`tokenHash`) is persisted in the database.
4. **Cookie Security:** The `pravaah_session_token` cookie is set with `HttpOnly: true`, `SameSite: "lax"`, `Path: "/"`, and `Secure: true` in production.
5. **Identity Isolation:** Client-provided `x-user-id` headers and raw cuid user IDs in Bearer headers are strictly rejected. User identity is derived exclusively from the verified server-side session.
6. **Session Invalidation:** Logout explicitly sets `isRevoked: true` on the database session and clears client cookies.
7. **Analytics Protection:** Unauthenticated requests to `/api/v1/analytics/dashboard` are blocked with `HTTP 401 Unauthorized`.
8. **Admin Protection:** All admin routes (`/api/v1/admin/*`) require `{ requiredRole: "ADMIN" }`, returning `HTTP 403 Forbidden` for non-admin users.

---

## 5. Payment & Webhook Security Findings

1. **Server-Side Pricing Authority:** In `/api/v1/billing/checkout`, prices are fetched directly from the database (`Plan` and `PriceConfig` models). Client payloads cannot alter plan prices.
2. **Genuine Cryptographic HMAC-SHA256:**
   - **Audited Defect:** The previous webhook implementation compared `x-pravaah-webhook-signature` directly to `PAYMENT_WEBHOOK_SECRET` as a shared token, which did not verify payload integrity.
   - **Fix Applied:** Refactored `app/api/v1/billing/webhook/route.ts` to read the raw request body (`request.text()`) and compute `crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")`.
   - **Verification:** Uses `crypto.timingSafeEqual` for constant-time comparison.
   - **Production Guard:** In production, ONLY valid HMAC-SHA256 signatures are accepted. In non-production, the dev secret is tolerated to preserve sandbox UI testing.
3. **Idempotent Processing:** Webhooks check `if (payment.status === "SUCCESS")` and return immediately without duplicating subscription periods.
4. **Mock vs Real Separation:** The checkout engine explicitly records `provider: "SANDBOX_MOCK"`. Live gateway transactions (Razorpay / Stripe) are not activated.

---

## 6. Central Environment Validation Module

Created `lib/env.ts` (with ESM companion `lib/env.js`) providing `validateEnvironment()`:
- Validates database protocol (enforces PostgreSQL in production, rejects SQLite).
- Validates `PAYMENT_WEBHOOK_SECRET` presence and length (>= 16 characters) in production.
- Validates `NODE_ENV`.
- Scans `NEXT_PUBLIC_*` variables to ensure no secrets or API keys are leaked to client bundles.
- Emits sanitized diagnosis without exposing credentials.

---

## 7. Summary of Files Modified & Created

| File | Status | Description of Change |
| :--- | :---: | :--- |
| **`lib/env.ts`** | **Created** | Server-side environment validator with strict production safety rules. |
| **`lib/env.js`** | **Created** | ESM runtime implementation for test runners and serverless execution. |
| **`lib/prisma.ts`** | **Modified** | Assigned `globalForPrisma.prisma = prisma;` unconditionally to preserve client singleton in warm serverless containers. |
| **`app/api/v1/billing/webhook/route.ts`** | **Modified** | Upgraded to genuine HMAC-SHA256 verification over raw request body with constant-time equality. |
| **`.env.example`** | **Modified** | Updated template with clear required/optional/legacy classifications. |
| **`tests/production_security_readiness.test.mjs`** | **Created** | 9 focused security unit tests covering analytics guards, session validity, admin RBAC, data isolation, HMAC webhook verification, and SQLite rejection. |

---

## 8. Tests Executed & Actual Results

### 8.1 TypeScript Type Checking
- **Command:** `npx tsc --noEmit`
- **Result:** **PASS (0 errors)**

### 8.2 Prisma Schema Validation
- **Command:** `npx prisma validate`
- **Result:** **PASS** (`The schema at prisma/schema.prisma is valid 🚀`)

### 8.3 Security & Pure Unit Test Suite
- **Command:** `node --test tests/scoring.test.mjs tests/auth_security_pure.test.mjs tests/production_security_readiness.test.mjs`
- **Result:** **PASS (17 passed, 0 failed, 0 skipped, 193ms)**
  1. `Auth Security: Scrypt password hashing produces secure unique salt & key` (PASS)
  2. `Auth Security: Empty or malformed credentials fail safely` (PASS)
  3. `Auth Security: Legacy SHA-256 fallback validates and flags needsRehash` (PASS)
  4. `Auth Security: Cryptographic Session token generation has 256-bit entropy and irreversible hash` (PASS)
  5. `Webhook Security: HMAC-SHA256 signature validation with timing-safe comparison` (PASS)
  6. `1. Unauthenticated Analytics Access: Fails closed with HTTP 401 Unauthorized` (PASS)
  7. `2. Invalid Session Token: Rejects empty, truncated, or non-hex candidate strings` (PASS)
  8. `3. Expired Session: Validates that expired sessions are strictly rejected` (PASS)
  9. `4. Revoked Session: Logout invalidation marks isRevoked: true and blocks access` (PASS)
  10. `5. Role Authorization: Aspirant blocked from Admin endpoints with HTTP 403 Forbidden` (PASS)
  11. `6. Cross-User Data Isolation: Scopes queries strictly by authenticated user ID` (PASS)
  12. `7. Webhook Security: Genuine HMAC-SHA256 signature verification over raw request body` (PASS)
  13. `8. Environment Validation: Detects missing DATABASE_URL and PAYMENT_WEBHOOK_SECRET in production` (PASS)
  14. `9. Production SQLite Rejection: Prohibits SQLite protocol (file:) when NODE_ENV is production` (PASS)
  15. `UPSC GS Paper 1 Scoring Formula (+2.0 for correct, -0.666 for incorrect)` (PASS)
  16. `UPSC CSAT Paper 2 Scoring Formula (+2.5 for correct, -0.833 for incorrect)` (PASS)
  17. `Zero attempts and negative score handling` (PASS)

### 8.4 Production Build Verification
- **Command:** `npm run build` (`prisma generate && next build`)
- **Result:** **PASS** (Compiled all 32 static and dynamic routes cleanly with zero build errors).

### 8.5 ESLint Status
- **Status:** **NOT RUN / UNCONFIGURED**
- **Reason:** `eslint` and `eslint-config-next` are not included in `package.json` devDependencies.

---

## 9. Remaining Manual Tasks for Project Owner

Before triggering the deployment to Vercel:

1. **Add Variables in Vercel Project Dashboard:**
   In [Vercel Project Settings > Environment Variables](https://vercel.com/aardhy-jains-projects/pravaah-upsc/settings/environment-variables):
   - `NEON_DATABASE_URL`: Set for **Production** and **Preview** (Sensitive).
   - `DATABASE_URL`: Set for **Production** and **Preview** (Sensitive).
   - `PAYMENT_WEBHOOK_SECRET`: Set for **Production** and **Preview** (Sensitive — 32-character hex).
2. **Review Staged Git Diff:**
   Review the changes in the section below and give approval before any commit or push is executed.
3. **Trigger Vercel Preview Build:**
   Once environment variables are configured and the commit is pushed, trigger a Preview build on branch `hotfix/live-analytics-auth-guard` to verify runtime behavior at `https://pravaah-upsc-cb1qa17yu-aardhy-jains-projects.vercel.app/`.

---

## 10. Known Limitations & Unresolved Risks

1. **Sandbox Mock Billing:** The checkout system operates in `SANDBOX_MOCK` mode. Integrating live Razorpay or Stripe will require attaching payment gateway SDKs and setting API keys in a subsequent release phase.
2. **Legacy Tests with DB Writes:** Legacy integration tests in `tests/` (`api_verification.test.mjs`, `postgresql_compatibility.test.mjs`, `security_auth_isolation.test.mjs`) contain `prisma.user.create()` operations designed for local throwaway databases. They must NOT be run against production connection strings.
3. **Database Migration Pipeline:** There is currently no `_prisma_migrations` tracking table in Neon. Schema changes must continue to be handled via reviewed SQL scripts rather than automated `prisma migrate deploy`.

---

## 11. Final Completion Status

```
================================================================================
DAY 4.7 PRODUCTION READINESS STATUS:
================================================================================
A. Coding status:         PASS (All fixes implemented and validated)
B. Security status:       PASS (Auth guard, HMAC webhook, session isolation verified)
C. Build status:          PASS (Next.js production build compiled 32/32 routes)
D. Tests:                 PASS (17/17 pure unit and security tests passed in 193ms)
E. Database safety:       CONFIRMED (Zero production writes or migrations performed)
F. Environment variables: NEON_DATABASE_URL, DATABASE_URL, PAYMENT_WEBHOOK_SECRET
G. Git status:            Awaiting user review (Zero commits pushed)
H. Next recommended step: Review git diff, approve commit, configure Vercel env
================================================================================
```
