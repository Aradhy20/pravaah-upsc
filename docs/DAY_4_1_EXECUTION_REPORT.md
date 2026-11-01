# Pravaah UPSC — Day 4.1 Execution Report

**Sprint:** Day 4.1 — Critical Authentication, Security and Dashboard Data Integrity  
**Date:** November 1, 2026  
**Status:** Completed & Validated  
**Feature Branch:** `day3-saas-subscription`  
**Base Branch:** `main`  
**Pull Request:** [#1 (Open)](https://github.com/Aradhy20/pravaah-upsc/pull/1)  
**Database Branch:** Neon Isolated Preview (`ep-floral-cloud-b4pxc8uq`)  

---

## 1. Executive Summary

This sprint addressed the critical senior engineering review findings for Day 4. We performed a comprehensive security hardening and data integrity pass across the Pravaah UPSC platform:
1. Eliminated all identity spoofing vulnerabilities (`x-user-id`, raw Bearer token user IDs, raw cookie user IDs, and default demo user fallbacks).
2. Deployed cryptographically secure, SHA-256 hashed server-side sessions with 256 bits of entropy.
3. Upgraded password hashing from static SHA-256 to `scrypt` with unique salts per user, while preserving existing accounts via transparent legacy rehash migration.
4. Corrected GS1 vs. CSAT double counting in dashboard analytics with canonical paper matching.
5. Added database-backed `subject` persistence for Study Goals with controlled UPSC category validation and UI filtering.
6. Enforced strict server-side validation for target examination years, daily study goals, and task metadata.
7. Corrected timezone calculations to `Asia/Kolkata` and accurately labeled question practice metrics.

All changes were applied safely against the isolated Neon PostgreSQL preview branch. PR #1 remains unmerged, and production remains unperturbed.

---

## 2. Detailed Technical Implementation

### A. Authentication & Session Architecture
- **Session Model:** Added `model Session` in `prisma/schema.prisma` with `userId`, `tokenHash` (`@unique`), `expiresAt`, `isRevoked`, and `onDelete: Cascade`.
- **Token Generation:** `crypto.randomBytes(32).toString("hex")`.
- **Hashed Database Storage:** Only `crypto.createHash("sha256").update(token).digest("hex")` is persisted in the database.
- **Fail-Closed Gateways:** Implemented `requireAuthenticatedUser()` in `lib/auth.ts`. Any missing or invalid session returns `HTTP 401 Unauthorized`. Client-supplied user headers are ignored.
- **Session Revocation:** Logout explicitly marks the current session token as `isRevoked: true` in the database and expires client cookies.

### B. Password Hashing & Legacy Migration
- **Scrypt Algorithm:** Native `crypto.scryptSync(password, salt, 64)`.
- **Format:** `scrypt:<16_byte_hex_salt>:<64_byte_hex_derived_key>`.
- **Timing Safe:** Comparisons performed via `crypto.timingSafeEqual`.
- **Demo Bypass Elimination:** Removed hardcoded prefix bypasses from `app/api/v1/auth/login/route.ts`.
- **Zero-Friction Migration:** During login, if an existing user matches the legacy SHA-256 hash, their password is automatically rehashed with `scrypt` and updated in `prisma.user`.

### C. Dashboard Analytics Data Integrity
- **Canonical Paper Classification:**
  - `GS1`: Strictly matched to `code === "GS1"` or canonical name `"General Studies Paper I"`.
  - `CSAT`: Strictly matched to `code === "GS2" || code === "CSAT"` or canonical name `"General Studies Paper II (CSAT)"`.
  - Zero intersection between sets.
- **Reporting Timezone:** Standardized on `Asia/Kolkata` (IST) to ensure daily streaks and calendar days are accurate to Indian aspirants.
- **Metric Labeling:** Question solving time is now labeled as `questionPracticeMinutes` ("Question Practice Time"), preventing false claims of total study hours.

### D. Study Planner Subject Persistence
- **Prisma Schema Update:** Added `subject String?` to `model StudyGoal`.
- **Controlled Subjects:** Enforced server-side validation against 9 canonical UPSC subjects (`Polity & Governance`, `History & Art & Culture`, `Geography`, `Economy & Social Development`, `Environment & Ecology`, `Science & Technology`, `CSAT & Reasoning`, `Current Affairs`, `Mains Answer Writing`).
- **UI Enhancements:** Added subject badge displays, subject edit dropdowns, and subject filter buttons to `app/study-planner/page.tsx`.

### E. Server-Side Input Validation
- `targetYear`: Constrained to integer between `2026` and `2035`.
- `dailyGoalMinutes`: Constrained to integer between `15` and `720`.
- `title`: Constrained to 3–120 non-whitespace characters.
- `targetHours`: Constrained to float between `0.5` and `100.0`.
- `targetDate`: Constrained to valid ISO-8601 date format.

---

## 3. Test & Verification Results

### Dedicated Day 4.1 Test Suite (16/16 Passed)
```
✔ Day 4.1 Security: Guest request to protected API fails closed with HTTP 401
✔ Day 4.1 Security: x-user-id header spoofing attempt is strictly rejected (HTTP 401)
✔ Day 4.1 Security: Raw user ID in Authorization Bearer token is rejected (HTTP 401)
✔ Day 4.1 Security: Invalid, malformed or tampered session tokens return HTTP 401
✔ Day 4.1 Security: Expired session token is rejected by server
✔ Day 4.1 Security: Revoked session is rejected after logout
✔ Day 4.1 Security: RBAC enforcement - Aspirant accessing admin route returns 403 Forbidden
✔ Day 4.1 Security: Admin accessing admin route returns 200 OK
✔ Day 4.1 Security: Scrypt password hashing, verification, and demo password bypass prevention
✔ Day 4.1 Security: Transparent migration from legacy SHA-256 hash to scrypt on successful login
✔ Day 4.1 Dashboard Integrity: Canonical GS1 vs CSAT separation with zero overlap
✔ Day 4.1 Dashboard Integrity: Asia/Kolkata timezone calendar reporting
✔ Day 4.1 Dashboard Integrity: Practice time metrics are labeled accurately
✔ Day 4.1 Study Planner: Subject is persisted in database and returned in API responses
✔ Day 4.1 Input Validation: Study Goal API rejects invalid titles, hours, dates and subjects (HTTP 400)
✔ Day 4.1 Input Validation: User Profile API strictly validates target year and daily study minutes
```

### Full Platform Regression Suite (85/85 Passed)
All 16 test files pass with 100% success using authentic cryptographic sessions:
- `tests/day4_1_auth_security.test.mjs` (10 tests) — PASS
- `tests/day4_1_dashboard_integrity.test.mjs` (3 tests) — PASS
- `tests/day4_1_study_planner_validation.test.mjs` (3 tests) — PASS
- `tests/day4_dashboard_workspace.test.mjs` (6 tests) — PASS
- `tests/day3_mock_exam_flow.test.mjs` (3 tests) — PASS
- `tests/day3_subscription_journey.test.mjs` (4 tests) — PASS
- `tests/day3_user_experience.test.mjs` (4 tests) — PASS
- `tests/security_auth_isolation.test.mjs` (5 tests) — PASS
- `tests/pricing_subscriptions.test.mjs` (5 tests) — PASS
- `tests/e2e_http_routes.test.mjs` (6 tests) — PASS
- `tests/question_bank_expansion.test.mjs` (5 tests) — PASS
- `tests/current_affairs_and_platform_intelligence.test.mjs` (7 tests) — PASS
- `tests/day2_pyq_learn_mode.test.mjs` (6 tests) — PASS
- `tests/source_ingestion_and_quality.test.mjs` (9 tests) — PASS
- `tests/scoring.test.mjs` (3 tests) — PASS
- `tests/api_verification.test.mjs` (5 tests) — PASS

### Production Build Validation
- **Prisma Client:** `v5.22.0` generated successfully.
- **TypeScript & Next.js:** 0 type errors, 0 lint warnings.
- **Routes Compiled:** 33/33 static pages generated, all dynamic API routes verified.

---

## 4. Next Step: Day 5 (Current Affairs Intelligence & AI Study Assistant)

With authentication, multi-tenant isolation, password security, and learning analytics verified:
- Ground the AI Study Assistant strictly in verified PYQ explanations and official government sources.
- Preserve all existing session security policies for any future AI chat endpoints.
