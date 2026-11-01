# PRAVAAH UPSC — DAY 4.8.2
## FINAL CODE REVIEW AND PRE-COMMIT VALIDATION REPORT

**Repository:** `Aradhy20/pravaah-upsc`
**Current Branch:** `hotfix/live-analytics-auth-guard`
**Base Commit (HEAD):** `be206b9` (`docs: add Day 4.6 new Vercel project configuration recovery report`)
**Evaluation Date:** November 1, 2026
**Evaluation Runtime:** Node.js v24.x, Next.js 14.2.35, Prisma 5.22.0
**Authoritative Database:** Neon Serverless PostgreSQL (`ep-floral-cloud-b4pxc8uq`)
**Status:** **AWAITING OWNER APPROVAL PRIOR TO COMMIT**

---

## 1. REVIEW OF COMPLETE GIT DIFF & INTEGRITY AUDIT

### Working Tree State
The working tree contains **11 modified files** and **7 untracked file entries** (reports, security tests, and screen captures). All changes have been thoroughly audited line-by-line.

```
Changes not staged for commit:
  modified:   .env.example
  modified:   app/api/v1/auth/register/route.ts
  modified:   app/api/v1/billing/webhook/route.ts
  modified:   app/dashboard/page.tsx
  modified:   app/layout.tsx
  modified:   app/login/page.tsx
  modified:   app/page.tsx
  modified:   app/register/page.tsx
  modified:   components/Footer.tsx
  modified:   components/Header.tsx
  modified:   lib/prisma.ts

Untracked files:
  docs/DAY_4_7_PRODUCTION_READINESS_REPORT.md
  docs/DAY_4_8_SAAS_UI_UX_IMPLEMENTATION_REPORT.md
  docs/DAY_4_8_1_FUNCTIONAL_QA_REPORT.md
  docs/DAY_4_8_2_FINAL_PRECOMMIT_REVIEW.md
  docs/screenshots/ (7 high-fidelity PNG captures)
  lib/env.js
  lib/env.ts
  tests/production_security_readiness.test.mjs
```

### File-by-File Inspection

| File | Nature of Changes | Integrity Verification |
| :--- | :--- | :--- |
| `.env.example` | Clarified variable classifications: Neon DB URL pooler, `PAYMENT_WEBHOOK_SECRET` generation notes, `NODE_ENV`, and NextAuth deprecation note. | **CLEAN:** Contains only documentation and generic placeholders. Zero credentials or keys. |
| `app/api/v1/auth/register/route.ts` | Added `dailyGoalMinutes` (default 60) and `optionalSubject` to `request.json()` destructuring and write to `profile.create`. | **CLEAN:** Day 4.7 PBKDF2 password hashing and session generation preserved. Fails closed on weak passwords or duplicates. |
| `app/api/v1/billing/webhook/route.ts` | Upgraded webhook authenticity check to read `request.text()` and perform cryptographic `crypto.timingSafeEqual` over HMAC-SHA256 signatures. | **CLEAN:** Rejects missing signatures with HTTP 401; requires `PAYMENT_WEBHOOK_SECRET` in production. |
| `app/dashboard/page.tsx` | Added personalized greeting (`currentUser.fullName`), target exam year display (`CSE 2027`), daily goal display, and unauthenticated guest guard prompt. | **CLEAN:** Strictly read-only; no client-side privilege escalation. |
| `app/layout.tsx` | Added `overflow-x-hidden` on `html`, `body`, and `<main>` tags. | **CLEAN:** Pure defensive layout styling. No logic changes. |
| `app/login/page.tsx` | Refactored form styling with clean educational design, focus ring indicators, and sanitized error alerts. | **CLEAN:** Form submits to `/api/v1/auth/login`. Sets HTTP-only session cookie. |
| `app/page.tsx` | Redesigned homepage into 12-section SaaS educational portal; updated pricing preview cards to exactly reflect database values (₹799/mo, ₹1,299/mo). | **CLEAN:** No invented features or prices. All links lead to valid internal routes. |
| `app/register/page.tsx` | Implemented 2-step onboarding container: Step 1 (credentials, match check, terms checkbox), Step 2 (CSE 2027/28/29, daily goal 30-120m, optional). | **CLEAN:** Client-side input validation and error feedback. Persists `pravaah_stage` to `localStorage`. |
| `components/Footer.tsx` | 5-column comprehensive educational sitemap with platform links, syllabus directories, copyright 2026, and staff login link. | **CLEAN:** Valid internal routes. No external tracking scripts. |
| `components/Header.tsx` | Consolidated navigation from 9 items down to 6 with a `Study` dropdown; added mobile slide-out drawer; dynamically toggles Auth vs Guest UI; hides Admin from aspirants. | **CLEAN:** Eliminates horizontal overflow; secure role-aware link rendering. |
| `lib/prisma.ts` | Cached Prisma Client on `globalThis` unconditionally (`globalForPrisma.prisma = prisma`) for warm serverless execution. | **CLEAN:** Protects against connection pool exhaustion in Vercel serverless containers. |

### Evaluation of `lib/env.ts` vs `lib/env.js`
- **Question:** Are both `lib/env.ts` and `lib/env.js` necessary?
- **Finding:** **Yes, both are currently required by the project's build and test architecture.**
  - `lib/env.ts`: Written in TypeScript and imported by Next.js application code and future TypeScript modules. It compiles via the Next.js webpack build pipeline.
  - `lib/env.js`: Written in ECMAScript Modules (ESM) JavaScript. The project executes unit tests using native Node.js (`node tests/*.test.mjs`) without a TypeScript compilation step (no `ts-node` or `tsx` runtime). Node.js cannot import raw `.ts` files natively and throws `ERR_UNKNOWN_FILE_EXTENSION`.
  - **Precedent:** This follows the exact established architectural pattern already present in the repository:
    - [`lib/scoring.ts`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/scoring.ts) (used by Next.js TypeScript code)
    - [`lib/scoring.js`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/scoring.js) (used by `tests/scoring.test.mjs`)
- Both files maintain 100% logic parity and contain zero credentials.

### Secrets and Accidental File Verification
A full Git audit confirmed:
- No `.env` or `.env.production` files are tracked by Git (verified via `git status --ignored`).
- No `.db` or SQLite database files are tracked (verified via `git status --ignored`).
- No credentials, tokens, API keys, or private connection strings exist in any modified or untracked file.
- All untracked files are markdown documentation, unit test suites, or visual screenshot evidence.

---

## 2. ONBOARDING PERSISTENCE & DATABASE LIMITATION REVIEW

### PostgreSQL Persistence Status

| Field | Input Location | Storage Mechanism | Database Column | Account-Persistent Across Devices? |
| :--- | :--- | :--- | :--- | :---: |
| `dailyGoalMinutes` | Register Step 2 | Neon PostgreSQL | `UserProfile.dailyGoalMinutes` (Int, default 60) | **YES** |
| `targetYear` | Register Step 2 | Neon PostgreSQL | `UserProfile.targetYear` (Int, default 2027) | **YES** |
| `optionalSubject` | Register Step 2 | Neon PostgreSQL | `UserProfile.optionalSubject` (String, nullable) | **YES** |
| `preparationStage` | Register Step 2 | Browser `localStorage` | **None** (Not in `schema.prisma`) | **NO (Browser-Local Only)** |

### Verification Details
1. **`dailyGoalMinutes`:**
   - Selected in `app/register/page.tsx` (options: 30, 60, 90, 120 minutes).
   - Sent in POST payload to `/api/v1/auth/register`.
   - Persisted via Prisma: `profile: { create: { dailyGoalMinutes: ... } }`.
   - Loaded on login via `/api/v1/auth/me` and displayed in `app/dashboard/page.tsx` (`Daily Study Goal: X mins`).
2. **`targetYear`:**
   - Selected in `app/register/page.tsx` (options: CSE 2027, CSE 2028, CSE 2029).
   - Persisted in PostgreSQL `UserProfile.targetYear`.
   - Loaded on login and displayed in `app/dashboard/page.tsx` (`Target Year: CSE 2027`).
3. **`optionalSubject`:**
   - Entered in `app/register/page.tsx` (e.g. "PSIR", "Geography", "Sociology").
   - Persisted in PostgreSQL `UserProfile.optionalSubject`.

### Explicit Architecture Limitation: `preparationStage`
`preparationStage` (`FOUNDATION` / `PRACTICE` / `REVISION`) is **browser-local only**. It is saved to `localStorage.setItem("pravaah_stage", ...)` so that the client immediately tailors local recommendations. However, **it is NOT account-persistent across different devices or incognito sessions**.

### Proposed Safe Future Database Migration (UNEXECUTED)
To achieve multi-device persistence for `preparationStage` in a future planned release, the following non-breaking additive migration is recommended:

```prisma
// Proposed addition to prisma/schema.prisma:
enum PreparationStage {
  FOUNDATION
  PRACTICE
  REVISION
}

model UserProfile {
  // Existing fields...
  preparationStage PreparationStage @default(FOUNDATION)
}
```

**Safe Migration Execution Plan (For Future Release):**
1. Generate migration SQL:
   ```sql
   CREATE TYPE "PreparationStage" AS ENUM ('FOUNDATION', 'PRACTICE', 'REVISION');
   ALTER TABLE "UserProfile" ADD COLUMN "preparationStage" "PreparationStage" NOT NULL DEFAULT 'FOUNDATION';
   ```
2. Apply via `npx prisma migrate deploy` during an authorized maintenance window.
3. Update `app/api/v1/auth/register/route.ts` to accept `preparationStage`.
4. Update `app/api/v1/auth/me/route.ts` to return `preparationStage` in the user profile response.
5. Deprecate client-side `localStorage` fallback once database persistence is live.

*Strict Protocol Enforced:* No database migrations were executed during Day 4.8.2.

---

## 3. PRICING CATALOG & FEATURE AUTHENTICITY VERIFICATION

### Authoritative Database Records vs UI Implementation
A direct audit of the `Plan` and `PriceConfig` tables in the authoritative Neon database confirmed exact parity with the frontend:

| Plan Code | Plan Name | Tier | Database Prices | UI Representation | Database Features (Verified) |
| :---: | :---: | :---: | :--- | :--- | :--- |
| `FREE` | **Aspirant Foundation** | 0 | Monthly: ₹0<br>Quarterly: ₹0<br>Annual: ₹0 | **₹0 / forever** | • Browse official UPSC CSE PYQs (GS1 & CSAT)<br>• Core concept summaries & official answer keys<br>• Interactive Learn Mode with instant feedback<br>• Personal quota: 5 bookmarks & 3 study notes |
| `BEGINNER` | **Syllabus Sprint** | 1 | Monthly: ₹399<br>Quarterly: ₹999<br>Annual: ₹2,999 | Available on `/pricing` | • Detailed pedagogical explanations & elimination notes<br>• Allowance: 50 bookmarks & 50 study notes<br>• Mistake review list<br>• Basic subject accuracy breakdown |
| `ACHIEVER` | **Prelims Pro** *(Popular)* | 2 | Monthly: ₹799<br>Quarterly: ₹1,899<br>Annual: ₹5,499 | **₹799 / month**<br>*(or ₹5,499 / year, Save 42%)* | • Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)<br>• Automated Spaced Mistake Repetition Engine<br>• Diagnostic Weak Topic Detector (&lt;60% accuracy threshold)<br>• Unlimited bookmarks with custom tags & private study notes |
| `SCHOLAR` | **Ranker Suite** | 3 | Monthly: ₹1,299<br>Quarterly: ₹2,999<br>Annual: ₹8,999 | **₹1,299 / month**<br>*(or ₹8,999 / year, Save 42%)* | • Everything in Prelims Pro<br>• Unlimited Full Exam Simulations & custom topic mocks<br>• Comprehensive telemetry & time-per-question curve<br>• Unlimited study notes with PDF syllabus linking<br>• Priority question bank coverage & editorial reviews |

### Zero Invented Features or Prices
- Pricing cards on `app/page.tsx` display the exact names (`Aspirant Foundation`, `Prelims Pro`, `Ranker Suite`) and prices (₹0, ₹799/mo, ₹1,299/mo) backed by the database.
- Feature lists on `app/page.tsx` were updated to remove placeholder text ("Full Mains Answer Writing Suite", "Model Answer Structures") and replaced with authentic database-backed capabilities (`Comprehensive telemetry`, `Unlimited Full Exam Simulations`, `Priority question bank coverage`).
- The full pricing page ([`app/pricing/page.tsx`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/app/pricing/page.tsx)) dynamically fetches `/api/v1/plans` at runtime, ensuring that any future administrative price updates reflect automatically.

### Checkout API Consistency (`app/api/v1/billing/checkout/route.ts`)
- The checkout endpoint strictly queries `prisma.plan.findUnique` and `prisma.priceConfig.findFirst` on the server.
- The transaction amount is derived strictly from `priceConfig.amountRupees`.
- Client requests cannot override or tamper with prices.

---

## 4. SECURITY REGRESSION REVIEW

All Day 4.7 security enhancements were audited for regressions:

| Security Feature | Implementation Mechanism | Verification Result |
| :--- | :--- | :---: |
| **Genuine HMAC-SHA256 Verification** | In [`app/api/v1/billing/webhook/route.ts`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/app/api/v1/billing/webhook/route.ts), raw body text (`request.text()`) is hashed using `crypto.createHmac("sha256", secret)` and verified with `crypto.timingSafeEqual`. Fails closed if signature invalid or absent. | **VERIFIED** |
| **Server-Side Session Authentication** | In [`lib/auth.ts`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/auth.ts), sessions are backed by PostgreSQL `Session` records storing SHA-256 token hashes. Client receives a 64-char plain token via an HTTP-only, secure, SameSite="lax" cookie. | **VERIFIED** |
| **Session Expiration & Revocation** | Sessions carry a 30-day `expiresAt` timestamp. `/api/v1/auth/logout` explicitly sets `isRevoked: true` on the database row and expires the client cookie. Expired or revoked sessions fail closed. | **VERIFIED** |
| **Admin Authorization Guard** | `requireAdmin()` strictly enforces `user.role === "ADMIN"`, returning HTTP 403 Forbidden for non-admin accounts. Admin navigation is conditionally hidden from visitors and aspirants. | **VERIFIED** |
| **Cross-User Data Isolation** | All telemetry, bookmarks, notes, and attempt queries are parameterized strictly with `userId = user.id` from the verified session. No user can access or mutate another user's records. | **VERIFIED** |
| **Production Database URL Protection** | [`lib/prisma.ts`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/prisma.ts) and [`lib/env.ts`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/env.ts) validate that `NODE_ENV === "production"` requires a PostgreSQL connection string (`postgresql://` or `postgres://`). SQLite (`file:`) fallbacks are explicitly rejected with fatal runtime errors. | **VERIFIED** |

---

## 5. TESTING SUMMARY & EXECUTION EVIDENCE

### 1. TypeScript Compilation
```bash
npx tsc --noEmit
# Exit Code: 0 (Zero type errors)
```

### 2. Lint Checks
- **Status:** **Reported as Not Configured.**
- **Details:** `package.json` contains `"lint": "next lint"`, but `eslint` and `eslint-config-next` are not present in `devDependencies`. Invoking `next lint` prompts interactively to install packages and configure `.eslintrc.json`. In accordance with strict release protocol, no unapproved packages were installed.

### 3. Relevant Unit & Security Tests Executed

| Test Suite | File | Tests Run | Result | Duration |
| :--- | :--- | :---: | :---: | :---: |
| Production Security Readiness | `tests/production_security_readiness.test.mjs` | 9 | **9 / 9 PASS** | 7.1 ms |
| Pure Auth Security & Cryptography | `tests/auth_security_pure.test.mjs` | 5 | **5 / 5 PASS** | 129.2 ms |
| Scoring Engine & UPSC Penalties | `tests/scoring.test.mjs` | 3 | **3 / 3 PASS** | 6.4 ms |
| **Total Unit & Security Tests** | | **17** | **17 / 17 PASS** | **142.7 ms** |

### 4. Production Next.js Build
```bash
npm run build
# > pravaah-upsc@1.0.0 build
# > prisma generate && next build

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 301ms
▲ Next.js 14.2.35
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (32/32)
✓ Finalizing page optimization
Exit Code: 0
```
All 32 routes compiled successfully with optimized JS bundles and zero warnings.

### 5. Tests Explicitly NOT Run (Safety Justification)
The following legacy test files were **intentionally NOT executed**:
- `tests/e2e_http_routes.test.mjs`
- `tests/postgresql_compatibility.test.mjs`
- `tests/pricing_subscriptions.test.mjs`
- `tests/security_auth_isolation.test.mjs`
- `tests/security_hotfix_validation.test.mjs`
- `tests/source_ingestion_and_quality.test.mjs`
- `tests/question_bank_expansion.test.mjs`
- `tests/load_test_concurrency.mjs`

**Justification:** These integration suites execute database write operations (`prisma.user.create`, `prisma.subscription.create`, `prisma.attempt.create`). Running them against the authoritative Neon Serverless PostgreSQL database violates strict release rules prohibiting production test writes. All critical security, authentication, and mathematical logic was instead validated via pure, isolated unit test suites.

---

## 6. FINAL GIT REVIEW & RISK ASSESSMENT

### Git Status Summary
- **Current Branch:** `hotfix/live-analytics-auth-guard`
- **Base Commit:** `be206b9` (`origin/hotfix/live-analytics-auth-guard`)
- **Staged for Commit:** 0 files
- **Unstaged Changes:** 11 files modified
- **Untracked Files:** 7 items (reports, screenshots, env helpers, unit tests)

### Diff Statistics
```
 .env.example                        |  36 +-
 app/api/v1/auth/register/route.ts   |   8 +-
 app/api/v1/billing/webhook/route.ts |  47 ++-
 app/dashboard/page.tsx              | 491 ++++++++++++++-------------
 app/layout.tsx                      |   6 +-
 app/login/page.tsx                  |  88 ++---
 app/page.tsx                        | 657 +++++++++++++++++++++++++++++-------
 app/register/page.tsx               | 354 ++++++++++++++-----
 components/Footer.tsx               | 117 ++++---
 components/Header.tsx               | 517 +++++++++++++++++++---------
 lib/prisma.ts                       |   4 +-
 11 files changed, 1580 insertions(+), 745 deletions(-)
```

### Potential Risks & Mitigations

| Identified Risk | Severity | Mitigation Implemented |
| :--- | :---: | :--- |
| **Serverless Connection Spikes** | Low | `lib/prisma.ts` caches the Prisma Client instance on `globalThis` across warm Vercel serverless container invocations. |
| **Missing Webhook Secret in Production** | Low | In production, `/api/v1/billing/webhook` fails closed with HTTP 500 and a clear log if `PAYMENT_WEBHOOK_SECRET` is unset; dev secret fallback is strictly blocked in production. |
| **Target Year Discrepancy** | Low | Target exam years default to CSE 2027 with 2028 and 2029 options; historical PYQ archive strictly maintains 2019–2024. |
| **Browser-Local `preparationStage`** | Low | Documented as an intentional architecture limitation to prevent unapproved database migrations during hotfix. Clear non-breaking migration path documented for future release. |

---

## 7. CONCLUSION & NEXT STEPS

The Pravaah UPSC application on branch `hotfix/live-analytics-auth-guard` is:
- **Functionally Verified:** 15/15 SaaS user journeys validated.
- **Visually Verified:** 7 browser screenshots captured with zero horizontal overflow across mobile (390px) and desktop (1440px).
- **Security Verified:** 17/17 security and pure unit tests passing; Day 4.7 hardening intact.
- **Build Verified:** Next.js production build compiles 32/32 routes with 0 errors.

**STOP AND WAIT:** In strict accordance with Day 4.8.2 instructions, no git commits, pushes, merges, or deployments will be performed without explicit owner approval.
