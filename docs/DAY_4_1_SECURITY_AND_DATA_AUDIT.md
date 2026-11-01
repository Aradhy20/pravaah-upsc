# Pravaah UPSC — Day 4.1 Security & Data Integrity Audit Report

**Date:** November 1, 2026  
**Auditor:** Principal Application Security Engineer & QA Lead  
**Branch:** `day3-saas-subscription`  
**PR:** [#1](https://github.com/Aradhy20/pravaah-upsc/pull/1) (Open — unmerged)  
**Target Environment:** Isolated Neon PostgreSQL Preview Branch (`ep-floral-cloud-b4pxc8uq`)  

---

## 1. Executive Summary

During the Day 4 senior engineering review, critical security bypass vulnerabilities and dashboard data-correctness deficiencies were identified on the `day3-saas-subscription` branch. This dedicated **Day 4.1 Security and Data Integrity Sprint** resolved all critical (P0), high (P1), and medium (P2) findings without architectural regressions or database drops.

All fixes have been verified with 16 newly constructed dedicated automated test cases in `tests/day4_1_auth_security.test.mjs`, `tests/day4_1_dashboard_integrity.test.mjs`, and `tests/day4_1_study_planner_validation.test.mjs`, alongside 69 regression tests across the existing suite (85 total passing tests).

---

## 2. Findings & Remediation Analysis

### P0 — Authentication Bypass & Impersonation (RESOLVED)

#### Vulnerability Description
Prior to Day 4.1, `lib/auth.ts` permitted client-supplied headers (`x-user-id`) and raw user IDs in `Bearer` tokens or cookies (`pravaah_user_id`) to dictate authenticated identity. Furthermore, `getCurrentUser()` defaulted to a demo aspirant account (`aspirant@pravaah.in`) whenever credentials were missing. An unauthenticated attacker could impersonate any user or admin by simply transmitting `x-user-id: <victim_user_id>` or invoking endpoints anonymously.

#### Architecture of the Solution
1. **Cryptographic Server-Side Sessions:**
   - Implemented `model Session` in `prisma/schema.prisma` with `id`, `userId`, `tokenHash` (`@unique`), `expiresAt`, `createdAt`, and `isRevoked`.
   - Every session is generated with `crypto.randomBytes(32).toString("hex")` (256 bits of cryptographic entropy).
   - The database stores **only** the SHA-256 hash of the session token (`tokenHash`). Even a database read leak cannot compromise active sessions.
2. **Zero Trust Identity Resolution:**
   - Client-supplied `x-user-id` and raw user IDs in Bearer headers are strictly ignored and rejected.
   - Authentication tokens are read strictly from the `pravaah_session_token` cookie or `Authorization: Bearer <32_byte_session_token>`.
   - The token is hashed via SHA-256 and verified against unrevoked, unexpired records in `prisma.session`.
3. **Fail-Closed Default:**
   - All protected APIs (`/api/v1/analytics/dashboard`, `/api/v1/user/*`, `/api/v1/admin/*`, `/api/v1/tests/session/*`, `/api/v1/billing/*`) invoke `requireAuthenticatedUser()`.
   - When no valid session exists, the server immediately halts processing and returns `HTTP 401 Unauthorized` with `{"success": false, "error": { "code": "UNAUTHORIZED" }}`.
   - Default demo fallbacks are completely eliminated from `getCurrentUser()`.
4. **Cookie Hardening:**
   - `HttpOnly: true` (prevents XSS access to tokens).
   - `Secure: true` in production environments.
   - `SameSite: "lax"` (mitigates CSRF while allowing standard navigation).
   - `Path: "/"`.
   - Explicit 7-day expiration (`maxAge: 7 * 24 * 60 * 60`).
   - Legacy `pravaah_user_id` cookies are explicitly deleted upon login/logout.

---

### P0 — Weak Password Protection & Demo Bypass (RESOLVED)

#### Vulnerability Description
`hashPassword()` previously used static SHA-256 with a hardcoded static salt (`"pravaah_salt_2026"`). Additionally, `app/api/v1/auth/login/route.ts` contained an authentication bypass allowing arbitrary passwords for any account whose `passwordHash` began with `"pravaah_demo_hash_"`.

#### Architecture of the Solution
1. **Scrypt Cryptographic Hashing with Unique Per-Password Salts:**
   - Passwords are now hashed using Node.js native `crypto.scryptSync(password, salt, 64)`.
   - A unique 16-byte random salt is generated for each password (`crypto.randomBytes(16).toString("hex")`).
   - Output format: `scrypt:<hex_salt>:<hex_derived_key>`.
   - Verification uses `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
2. **Elimination of Demo Bypass:**
   - Removed `user.passwordHash.startsWith("pravaah_demo_hash_")` from `app/api/v1/auth/login/route.ts`. Demo accounts must now provide valid credentials or be accessed via developer seed scripts.
3. **Transparent Legacy Password Migration:**
   - Existing accounts with legacy SHA-256 hashes are detected via `verifyPassword()`.
   - Upon successful verification of the legacy password, the login route automatically rehashes the user's password using `scrypt` with a fresh unique salt, updates the database record in `prisma.user`, and completes login without user interruption or account lockout.

---

### P1 — Incorrect GS1 vs. CSAT Analytics (RESOLVED)

#### Vulnerability Description
In `app/api/v1/analytics/dashboard/route.ts`, paper classification used a broad `startsWith("GS")` rule. Because CSAT is officially designated as GS Paper II (`code === "GS2"`), attempts on GS2 were counted as both GS1 and CSAT, corrupting aspirant accuracy metrics and total counts.

#### Architecture of the Solution
- Canonical separation established:
  - **GS Paper 1:** Strictly matches `code === "GS1"` or canonical name `"General Studies Paper I"`.
  - **CSAT Paper 2:** Strictly matches `code === "GS2"` or `code === "CSAT"` or canonical name `"General Studies Paper II (CSAT)"`.
- Disjoint set guarantee: Every question attempt is categorized into exactly one canonical paper bucket or discarded safely into an unknown bucket. Zero double counting.
- Verified by `tests/day4_1_dashboard_integrity.test.mjs`.

---

### P1 — Study Planner Subject Persistence (RESOLVED)

#### Vulnerability Description
The Study Planner UI provided a dropdown of 9 UPSC subjects, but `StudyGoal` had no subject field in the Prisma schema, and `/api/v1/user/goals` dropped the parameter.

#### Architecture of the Solution
1. **Schema Extension:**
   - Added optional `subject String?` field to `model StudyGoal` in `prisma/schema.prisma`.
   - Applied via additive `npx prisma db push` to Neon without data loss.
2. **Controlled Vocabulary Validation:**
   - Validated against the 9 canonical UPSC subjects:
     - `Polity & Governance`
     - `History & Art & Culture`
     - `Geography`
     - `Economy & Social Development`
     - `Environment & Ecology`
     - `Science & Technology`
     - `CSAT & Reasoning`
     - `Current Affairs`
     - `Mains Answer Writing`
3. **Full Lifecycle Persistence:**
   - Persisted on `POST /api/v1/user/goals`.
   - Updatable on `PATCH /api/v1/user/goals`.
   - Filterable via `GET /api/v1/user/goals?subject=Polity%20%26%20Governance`.
   - UI badges and filters rendered in `app/study-planner/page.tsx`.

---

### P1 — Server-Side Input Validation (RESOLVED)

#### Architecture of the Solution
Enforced strict server-side schema validation with descriptive HTTP 400 responses:
- **Target Examination Year (`/api/v1/user/profile` & `/auth/register`):**
  - Must be an integer between `2026` and `2035`.
  - Obsolete past years and non-numeric values are rejected with 400.
- **Daily Study Target (`/api/v1/user/profile`):**
  - Must be an integer between `15` and `720` minutes (15 mins to 12 hours).
  - Negative values, decimals, and extreme values rejected.
- **Study Goal Validation (`/api/v1/user/goals`):**
  - `title`: Trimmed string, length between 3 and 120 characters. Empty or whitespace-only rejected.
  - `targetHours`: Finite positive float between 0.5 and 100.0 hours.
  - `targetDate`: Valid ISO-8601 date format.

---

### P1/P2 — Dashboard Accuracy & Time Tracking Semantics (RESOLVED)

#### Architecture of the Solution
1. **Metric Re-labeling:**
   - Question attempt time is now accurately labeled as **`Question Practice Time`** (`questionPracticeMinutes`) rather than claiming to represent total aspirant study time.
   - In addition, the API incorporates tracked `StudyActivity` session durations (`totalStudyMinutes`) to distinguish active reading/planning from question solving.
2. **Timezone Correctness:**
   - Standardized on `Asia/Kolkata` (IST) as the canonical operational timezone for daily streaks, weekly aggregations, and calendar date bucketing.
   - Uses `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" })` (`YYYY-MM-DD`) to ensure UTC boundary shifts do not alter the displayed day.

---

## 3. Verification & Test Evidence Matrix

| Category | Test File | Tests Run | Result | Evidence / Coverage |
| :--- | :--- | :---: | :---: | :--- |
| **Authentication & RBAC** | `tests/day4_1_auth_security.test.mjs` | 10 | **PASS** | Guest 401, `x-user-id` spoofing rejected, raw Bearer rejected, session expiration, session revocation on logout, RBAC aspirant 403, admin 200, scrypt hashing, legacy hash migration. |
| **Dashboard Integrity** | `tests/day4_1_dashboard_integrity.test.mjs` | 3 | **PASS** | Canonical GS1 vs CSAT mutual exclusivity (0 overlap), `Asia/Kolkata` date reporting, accurate metric labeling. |
| **Planner & Validation** | `tests/day4_1_study_planner_validation.test.mjs` | 3 | **PASS** | Subject persistence in DB, controlled subject validation, title/hours/date validation, profile year/minutes limits. |
| **Workspace & Isolation** | `tests/day4_dashboard_workspace.test.mjs` | 6 | **PASS** | Full CRUD for goals, notes, bookmarks, profile preferences using authentic cryptographic session tokens. |
| **Security Isolation** | `tests/security_auth_isolation.test.mjs` | 5 | **PASS** | Multi-tenant cross-user isolation for notes, bookmarks, exam sessions; anti-leak protection; batch CSV import. |
| **Subscription & E2E** | `tests/day3_*.test.mjs` & `tests/pricing_subscriptions.test.mjs` | 22 | **PASS** | Checkout, signature verification, cancellation, mock test gates with session tokens. |
| **Platform Regression** | Full suite (`npm test`) | 85 | **PASS** | 100% pass across all regression test suites. |
| **Production Build** | `npm run build` | 33 routes | **PASS** | Prisma client v5.22.0 generated, 0 type errors, 33/33 static pages compiled successfully. |

---

## 4. Residual Risks & Next Steps

1. **Production Deployment Guard:** Pull Request #1 remains open and unmerged. Production database and credentials have not been touched directly.
2. **Vercel Preview Deployment:** Once committed and pushed to `day3-saas-subscription`, Vercel will build a fresh preview against the isolated Neon preview branch.
3. **Readiness for Day 5:** With authentication bypasses eliminated, passwords secured with `scrypt`, and analytics calculations corrected, the platform foundation is verified for Day 5 (AI Study Assistant & Current Affairs Intelligence).
