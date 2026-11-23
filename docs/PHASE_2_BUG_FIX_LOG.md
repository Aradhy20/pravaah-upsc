# PHASE 2: BUG FIX LOG & REMEDIATION RECORD
**Application:** Pravaah UPSC  
**Live URL:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Reporting Period:** Phase 2 Production Audit & QA  
**Date:** November 23, 2026  

---

## 1. Summary of Defects Fixed in Phase 2

| Bug ID | Component | Severity | Description | File(s) Modified | Status |
|:---|:---|:---:|:---|:---|:---:|
| **BUG-01** | Authentication | P0 | Password hash prefix bypass allowed arbitrary password login on demo-prefixed hashes | `app/api/v1/auth/login/route.ts` | **FIXED** |
| **BUG-02** | Database Seed | P0 | Admin and Aspirant default accounts had predictable demo hashes in synchronizer | `scripts/ensure_tables.mjs` | **FIXED** |
| **BUG-03** | Auth & Privacy | P1 | Unauthenticated visitors defaulted to shared `aspirant@pravaah.in` account, leaking user data | `lib/auth.ts`, `scripts/ensure_tables.mjs` | **FIXED** |
| **BUG-04** | Mock Tests UI | P1 | Mock tests catalog displayed fallback question count (`36`) for tests with 0 questions | `app/mock-tests/page.tsx` | **FIXED** |
| **BUG-05** | Question Bank | P1 | Production database had 120 published questions (Miyawaki question was in `NEEDS_REVIEW`) | `scripts/ensure_tables.mjs` | **FIXED** |
| **BUG-06** | Scheduled Jobs | P2 | `CRON_SECRET` used hardcoded string fallback in production environment | `app/api/v1/cron/daily-ingest/route.ts` | **FIXED** |
| **BUG-07** | Revision Queue | P2 | Unauthenticated visitors could POST to spaced-repetition revision endpoints | `app/api/v1/user/revision/route.ts` | **FIXED** |
| **BUG-08** | Subscriptions | P2 | Unauthenticated visitors could POST to subscription cancellation endpoint | `app/api/v1/user/subscription/cancel/route.ts` | **FIXED** |

---

## 2. Detailed Technical Fix Descriptions

### Bug 1: Password Hash Prefix Bypass (P0)
- **Root Cause:** `app/api/v1/auth/login/route.ts` contained `user.passwordHash.startsWith("pravaah_demo_hash_")`, allowing any password to match if the account was created with a demo prefix.
- **Fix:** Removed the prefix check completely. Enforced strict equality: `user.passwordHash === computedHash`.
- **Validation:** Automated test in `tests/phase2_qa_regression.test.mjs` verifies that invalid passwords for `admin@pravaah.in` return HTTP 401.

### Bug 2: Seeded Account Password Cryptography (P0)
- **Root Cause:** `scripts/ensure_tables.mjs` did not guarantee secure password hashes for seeded admin and aspirant accounts.
- **Fix:** Implemented salted SHA-256 password hashing for `admin@pravaah.in` (`Admin@Pravaah2026!`) and `aspirant@pravaah.in` (`Aspirant@Pravaah2026!`) using the production salt.
- **Validation:** Both accounts successfully authenticate with their exact credentials; invalid passwords are rejected.

### Bug 3: Unauthenticated Visitor Fallback & Data Leakage (P1)
- **Root Cause:** When an unauthenticated visitor visited the site, `getCurrentUser()` returned `aspirant@pravaah.in`. Any bookmarks, notes, or test submissions made by guests were written to this registered user's account.
- **Fix:** 
  1. Created a dedicated `guest-aspirant` record in `scripts/ensure_tables.mjs` with unusable password hash.
  2. Updated `lib/auth.ts` to fall back to `guest-aspirant`.
  3. Added `guest-aspirant` token recognition in `verifySessionToken`.
- **Validation:** Verified that guest users have zero access to private registered user bookmarks or test attempts.

### Bug 4: Mock Tests Catalog Phantom Question Count (P1)
- **Root Cause:** In `app/mock-tests/page.tsx`, `t.questions?.length || 36` defaulted to 36 if a test had 0 questions, misleading aspirants into starting empty tests.
- **Fix:** Changed query to `where: { questions: { some: {} } }` and updated the count expression to `t.questions?.length ?? 0`.
- **Validation:** Verified that empty tests are filtered out from the catalog and question counts accurately reflect database reality.

### Bug 5: Miyawaki Question Status Reconciliation (P1)
- **Root Cause:** Question `cmvqr30ot00665y3bp2632pvg` (2020 Prelims Miyawaki method question) was in `NEEDS_REVIEW` despite having verified options and a complete explanation, resulting in 120 published questions instead of 121.
- **Fix:** Added an automated reconciliation step in `scripts/ensure_tables.mjs` that promotes any question with verified correct options and an explanation to `PUBLISHED`.
- **Validation:** All 121 questions are now in `PUBLISHED` status.

### Bug 6: Production CRON Secret Fallback (P2)
- **Root Cause:** `app/api/v1/cron/daily-ingest/route.ts` fell back to `"pravaah_cron_secret_2026"` even in production.
- **Fix:** Updated fallback logic: `process.env.CRON_SECRET || (process.env.NODE_ENV !== "production" ? "pravaah_cron_secret_2026" : undefined)`. In production, a missing secret causes the endpoint to reject requests unless explicitly configured.
- **Validation:** Verified in `tests/phase2_qa_regression.test.mjs`.

### Bug 7 & 8: Revision and Subscription Route Auth Guards (P2)
- **Root Cause:** POST endpoints for `/api/v1/user/revision` and `/api/v1/user/subscription/cancel` allowed `guest-aspirant` requests through.
- **Fix:** Added explicit checks in both handlers returning HTTP 401 if `user.id === "guest-aspirant"`.
- **Validation:** Unauthenticated/guest requests to these routes receive HTTP 401.
