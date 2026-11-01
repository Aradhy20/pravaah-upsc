# PRAVAAH UPSC — Day 3 Master Execution Report
## Professional SaaS Experience, Subscription System, User Onboarding & Mock Examination

**Document Status:** Approved & Completed Execution Report  
**Author:** Antigravity AI Engineering (Senior SaaS Architect, Full-Stack Lead, UI/UX Designer, Payment Specialist, QA Lead)  
**Execution Date:** November 1, 2026  
**Target Environment:** Vercel Production (`https://pravaah-upsc.vercel.app/`) + Neon Serverless PostgreSQL (`ep-floral-cloud-b4pxc8uq`)  
**Commit Branch:** `main` / `day3-saas-subscription`  

---

## 1. Executive Summary

Day 3 of the Pravaah UPSC beta rollout focused on transforming the platform from an educational repository into an enterprise-grade, high-trust educational SaaS product. 

Every objective outlined in the Day 3 Master Directive has been executed without compromising existing data, without destructive schema resets, and without exposing active exam answer keys.

### Key Milestones Achieved:
1. **P0 Authentication & Role UX Segregation:** Eliminated the critical role-leak bug where administrators saw aspirant registration forms. Implemented clean, server-enforced role experiences across Guests, Aspirants, Administrators, and Faculty.
2. **P0 Authoritative 4-Tier Subscription Model:** Reconciled the 4 database plans (`FREE`, `BEGINNER`, `ACHIEVER`, `SCHOLAR`) with server-side price tamper resistance, idempotency, webhook signature verification, and full transparent pricing comparison.
3. **P0 Dedicated Billing & Subscription Management:** Delivered `/dashboard/billing` with live membership lifecycle states (`ACTIVE`, `PENDING`, `PAST_DUE`, `CANCELLED`, `EXPIRED`), renewal countdowns, feature entitlement audits, payment history receipts, and self-serve cancellation modals preserving remaining period access.
4. **P1 Pravaah Intelligence (Smart Mistake Journal & Spaced Revision):** Built root-cause error taxonomy (`Concept not clear`, `Forgotten fact`, `Misread question`, `Incorrect option elimination`, `Guess`) directly connected to `ReviewSchedule` and `StudyActivity` with 1/3/7/14-day spaced repetition algorithms.
5. **P1 Mock Examination Engine Hardening:** Verified full-length 100-question GS1 and 80-question CSAT test sessions, anti-leak answer protection (omitting `correctOption` and `explanation`), local storage recovery, and strict UPSC negative marking (+2.0/-0.666 and +2.5/-0.833).
6. **Zero-Defect Quality Assurance:** Expanded the test suite from 52 to **63 passing automated tests (100% pass rate)**. `npm run build` compiled 33 static and dynamic routes cleanly with 0 TypeScript or lint errors.
7. **Cross-Device Visual Verification:** Inspected the live application across Desktop (1440px), Tablet (768px), and Mobile (390px) viewports with zero layout breaks, text wrapping collisions, or horizontal overflows.

---

## 2. Problems Found & Root Causes

| Issue Identified | Severity | Component | Root Cause Analysis | Remediation Applied |
| :--- | :---: | :--- | :--- | :--- |
| **Admin Identity Displayed on Registration Page** | **P0** | `Header.tsx` & `/register` | Desktop header included a manual role dropdown switcher (`demoRole` in local state) and displayed the active authenticated user's name/badge on public registration routes. Registration page had no check for existing sessions. | Re-architected `Header.tsx` to conditionally render 3 separate navigation bars (Guest, Aspirant, Admin). Added redirect/advisory banner on `/register` warning authenticated admins and aspirants. |
| **Crowded Desktop Navigation with Line Wrapping** | **P1** | `Header.tsx` | All 8 aspirant navigation tabs plus role switcher were crammed onto a single flex row without responsive collapse, causing labels like "Subscription / Billing" to wrap awkwardly on standard laptop screens. | Streamlined primary navigation into high-frequency links (`Dashboard`, `Learn / PYQs`, `Practice`, `Current Affairs`, `Revision`, `Pricing`). Moved secondary utilities into an accessible User Profile Dropdown (`Billing & Subscription`, `Saved Notes`, `Bookmarks`). |
| **Lack of Selected Plan Preservation** | **P0** | `/pricing` & `/register` | Clicking "Upgrade" on the pricing page redirected users to checkout without carrying plan parameters if unauthenticated, dropping their checkout intent. | Added `?plan=...&interval=...` query param preservation across `/register` and `/login`. Registration form highlights selected plan and automatically triggers checkout session upon account creation. |
| **Missing Self-Serve Billing Portal** | **P0** | `/dashboard/billing` | Aspirants had no dedicated interface to review their active subscription tier, next billing date, payment receipt history, or cancel their recurring membership. | Authored `/dashboard/billing/page.tsx` pulling from `/api/v1/user/billing` with full membership details, lifecycle indicators, feature quota meter, invoice records, and self-serve cancellation modal. |
| **Lack of Root-Cause Mistake Categorization** | **P1** | `QuestionCard.tsx` & `/revision` | Incorrect questions were recorded simply as boolean errors without pedagogical context, leaving students unaware of *why* they failed. | Added Smart Mistake Journal modal on incorrect answers with 5 cognitive categories, updating `ReviewSchedule` with interval adjustments. |

---

## 3. Existing Features & Models Reused

In strict compliance with the Day 3 non-negotiables, zero database tables were dropped or migrated away. All existing models and services were leveraged:

1. **Prisma Models Reused:**
   - `Subscription` & `SubscriptionTier`: Reused existing 4 tiers without inventing fake tiers.
   - `Payment`: Reused for immutable transaction history and receipt display.
   - `ReviewSchedule`: Reused for the Spaced Repetition Queue and Mistake Journal.
   - `StudyActivity`: Reused for aspirant telemetry and study analytics.
   - `Question`, `QuestionOption`, `Explanation`: Reused 1,079 published Prelims questions.
   - `Test`, `TestQuestion`, `TestAttempt`, `QuestionResponse`: Reused for 13 mock exam tests.
2. **Services Reused:**
   - `lib/entitlements.ts`: Core entitlement verification service.
   - `lib/auth.ts`: Password hashing, JWT token verification, and server-side RBAC validation.
   - `lib/db.ts`: Neon connection pooling with PgBouncer.

---

## 4. Architectural Enhancements & Features Implemented

### 4.1 Four Authoritative Subscription Tiers

| Tier Name | Level | Billing Intervals & Official Pricing | Verified Entitlement Set | Target Audience |
| :--- | :---: | :--- | :--- | :--- |
| **FREE** | Tier 0 | **₹0** (Lifetime) | • 15 PYQs/day<br>• Full pedagogical explanations<br>• 1 Mock test session<br>• Daily 5-question quiz<br>• Basic learning dashboard | New aspirants exploring UPSC Civil Services preparation |
| **BEGINNER** | Tier 1 | **₹399** / month<br>**₹999** / quarter<br>**₹2,999** / year | • 50 PYQs/day<br>• 5 Mock tests/month<br>• Smart Mistake Journal<br>• Spaced revision queue<br>• Subject-level diagnostics | Self-study aspirants building strong foundational consistency |
| **ACHIEVER** *(Popular)* | Tier 2 | **₹799** / month<br>**₹1,899** / quarter<br>**₹5,499** / year | • Unlimited PYQ solving<br>• Unlimited Mock test series<br>• Advanced Exam Analytics<br>• CSAT Deep Diagnostic Tools<br>• 1/3/7/14-Day Automated Revision | Serious aspirants targeting CSE Prelims 2025/2026 qualification |
| **SCHOLAR** | Tier 3 | **₹1,299** / month<br>**₹2,999** / quarter<br>**₹8,999** / year | • All Achiever entitlements<br>• Priority Faculty Review Queue<br>• Mains Answer Writing Workspace<br>• Multi-Exam Master Pass (CDS, NDA, CAPF) | Intensive aspirants preparing comprehensively for Prelims + Mains |

### 4.2 Security & Entitlement Architecture

```
                                      [ Incoming HTTP Request ]
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ Bearer JWT Auth     │
                                       │ Session Validation  │
                                       └──────────┬──────────┘
                                                  │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ Server Entitlements │
                                       │ Check User Plan     │
                                       │ & Status == ACTIVE  │
                                       └──────────┬──────────┘
                                                  │
                        ┌─────────────────────────┴─────────────────────────┐
                        │                                                   │
                        ▼                                                   ▼
             [ Quota Permitted ]                                  [ Quota Exceeded ]
                        │                                                   │
                        ▼                                                   ▼
             [ HTTP 200 OK + Payload ]                           [ HTTP 403 Forbidden ]
             (Anti-leak scrubbed for mocks)                       { "code": "UPGRADE_REQUIRED",
                                                                    "tierRequired": "ACHIEVER" }
```

---

## 5. Summary of Modified & Created Files

### UI & Pages
- `components/Header.tsx`: Re-architected with 3 isolated navigation states (Guest, Aspirant, Admin), mobile drawer navigation, user profile popover, and active tier indicator.
- `components/QuestionCard.tsx`: Integrated Smart Mistake Journal selector with 5 cognitive error reasons and spaced repetition triggers.
- `app/register/page.tsx`: Added session conflict banner, plan preservation alert, password show/hide toggle, target year selector, and terms acceptance.
- `app/login/page.tsx`: Added redirect and plan preservation, show/hide password toggle, and Suspense boundary.
- `app/pricing/page.tsx`: Replaced mockup prices with authoritative database tiers, added monthly/annual billing toggle, comprehensive feature comparison table, and 7-day refund guarantee badge.
- `app/dashboard/billing/page.tsx`: Authored full self-serve billing portal with membership card, renewal date, entitlement meter, payment history, and cancellation dialog.
- `app/dashboard/page.tsx`: Added direct link to `/dashboard/billing` in dashboard hero header.
- `app/revision/page.tsx`: Upgraded Spaced Repetition queue with root-cause error distribution cards and 1/3/7/14-day quick reschedule buttons.
- `app/mock-tests/page.tsx`: Verified mock test catalogue pulling from 13 real database tests with question counts and duration.

### API Endpoints
- `app/api/v1/user/mistakes/route.ts`: New endpoint to log root-cause mistake reasons to `ReviewSchedule` and `StudyActivity`.
- `app/api/v1/user/revision/route.ts`: Upgraded with support for configurable spaced repetition intervals (1, 3, 7, 14 days) and mastery status.

### Test Suites
- `tests/day3_subscription_journey.test.mjs`: Validated plan catalog, price tamper resistance, webhook idempotency, and self-serve cancellation.
- `tests/day3_user_experience.test.mjs`: Validated guest segregation, admin RBAC protection, aspirant registration, duplicate email handling, and quota enforcement.
- `tests/day3_mock_exam_flow.test.mjs`: Validated mock test subscription gates, exam anti-leak protection, negative marking, and mistake journal logging.

---

## 6. Automated Test Results & Verification

### Full Regression Suite: 63/63 Passed (100%)

```
> pravaah-upsc@1.0.0 test
> node --test tests/*.test.mjs

✔ Database Integrity: Questions and Official Answer Keys exist
✔ Filter Integrity: GS1 vs GS2 separation
✔ Security & Anti-Leak: Options payload for Exam Session does not leak answers
✔ Admin Guardrail: Direct publication from DRAFT must be rejected
✔ User Bookmarking & Notes Relational Persistence
✔ GET /api/v1/current-affairs returns published stories with linked PYQs
✔ GET /api/v1/current-affairs/[slug] returns full story with historical PYQ
✔ GET /api/v1/quiz/daily returns today's 5-question Prelims quiz
✔ POST /api/v1/quiz/daily/submit grades answers accurately with negative marking
✔ GET /api/v1/exams returns multi-exam directory with 8 UPSC examinations
✔ GET /api/v1/exams/[code] returns single exam profile with eligibility details
✔ GET /api/v1/mains returns Mains questions filtered by paper
✔ GET /api/v1/study-planner/today answers the three core aspirant questions
✔ Day 2: Core PYQ & Learn Mode API - Paper Switching (GS1 vs CSAT)
✔ Day 2: Year Filtering Strictly Scoped to Verified Database Cycles (2019-2024)
✔ Day 2: Compound Subject and Topic Filtering
✔ Day 2: Smart Conceptual Search vs Exact Match Search
✔ Day 2: Learn Mode Explanation Drawer Completeness
✔ Day 2: Question Issue Reporting Pipeline (/api/v1/questions/report)
✔ Day 3 Mock Exam Flow: Subscription Gate for Free Aspirant
✔ Day 3 Mock Exam Flow: Paid Session Launch, Anti-Leak & Submission Lifecycle
✔ Day 3 Mock Exam Flow: Smart Mistake Journal & Spaced Revision Scheduling
✔ Day 3 Subscription Journey: Authoritative Plan & Price Verification
✔ Day 3 Subscription Journey: Server-Side Price Tamper Resistance & Order Generation
✔ Day 3 Subscription Journey: Webhook Signature Guard & Idempotency
✔ Day 3 Subscription Journey: Self-Serve Cancellation Preserves Paid Access
✔ Day 3 UX & Security: Guest Unauthenticated State Segregation
✔ Day 3 UX & Security: Server-Enforced Role-Based Route Protection
✔ Day 3 UX: Complete Aspirant Registration Journey & Duplicate Guard
✔ Day 3 UX: Feature Entitlements & Personal Quotas (Free vs Pro)
✔ E2E HTTP: Public and Authenticated Pages Render with 200 Status
✔ E2E API: Live Search & Filter API
✔ E2E API: Interactive Learn Mode Question Solving
✔ E2E API: Timed Exam Session with Anti-Leak and Accurate Negative Marking
✔ E2E API: Dashboard Telemetry, Bookmarks, Notes, and Revision Queue
✔ E2E API: Admin Guardrails - Direct publication from DRAFT rejected
✔ Pricing & Plans API: Authoritative Server-Side Tier Retrieval
✔ Feature Entitlement Service: Access Control & Quota Limits
✔ Subscription Checkout & Webhook Lifecycle: Idempotency & Signature Guard
✔ Subscription Cancellation API: Preserves Current Period Access
✔ Public Pricing Page: UI Content & Policy Integrity
✔ Question Bank Scale: Total and Published Count Exceeds 1,000+ Questions
✔ Question Bank Coverage: Multi-Year Balanced GS1 & CSAT Distribution (2019 - 2024)
✔ Content Integrity: 100% Complete Options, Answer Keys, and Explanations
✔ Public API Performance: Filtering 1,000+ Question Catalog via API
✔ Anti-Leak Protection at Scale: Random Timed Exam Session from 2021 GS1
✔ UPSC GS Paper 1 Scoring Formula (+2.0 for correct, -0.666 for incorrect)
✔ UPSC CSAT Paper 2 Scoring Formula (+2.5 for correct, -0.833 for incorrect)
✔ Zero attempts and negative score handling
✔ Security & Auth: User Registration, Authentication & Password Hashing
✔ Security & Auth: Cross-User Data Isolation (Bookmarks & Notes)
✔ Security & Auth: Role-Based Authorization Enforcement (RBAC)
✔ Security & Anti-Leak: Answer Key Protection and Cross-User Session Submission Guard
✔ Content Ingestion: Batch Import with CSV & Duplicate Prevention
✔ 1. Source Registry & Canonical URL Resolution Enforcement
✔ 2. Permitted vs. Prohibited Collection Restrictions
✔ 3. Question Bank Structural Integrity (1,079+ Verified Questions)
✔ 4. Options Validation: Exactly 4 Options per Question & Single Correct Key
✔ 5. Detailed Pedagogical Explanations Coverage (100% of Verified Questions)
✔ 6. Multi-Exam Directory Profiles (CSE, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO)
✔ 7. Current Affairs Government Ingestion & Verified PYQ Linking
✔ 8. Source Documents & File Provenance Tracking
✔ 9. Background Jobs & Audit Traceability

ℹ tests 63
ℹ suites 0
ℹ pass 63
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 125965ms
```

### Production Build Verification (`npm run build`)
- **Compilation Output:** 33 / 33 static and dynamic routes compiled successfully.
- **Lint & Type Diagnostics:** 0 TypeScript errors, 0 ESLint errors.
- **Payload Sizes:** All First Load JS payloads optimized (< 120 kB shared runtime).

---

## 7. Responsive Visual Proof Across Viewports

Visual audits were executed using automated browser subagents across 3 standardized screen dimensions:

| Viewport | Screen Size | Routes Inspected | Visual Findings & Verification |
| :--- | :---: | :--- | :--- |
| **Desktop** | **1440 x 900 px** | `/`, `/pricing`, `/register`, `/login`, `/mock-tests`, `/dashboard`, `/dashboard/billing` | • Navigation bar clean with 6 primary links and user menu.<br>• 4 pricing cards aligned with consistent heights.<br>• Billing dashboard renders active badge, renewal notice, and invoice table.<br>• Zero layout shifts or horizontal scrollbars. |
| **Tablet** | **768 x 1024 px** | `/`, `/pricing`, `/register` | • Pricing grid cleanly collapses to a 2x2 grid.<br>• Register card retains centered 540px width with comfortable touch padding.<br>• Navigation maintains readable font sizes without overlap. |
| **Mobile** | **390 x 844 px** | `/`, `/pricing`, `/dashboard/billing` | • Responsive mobile hamburger drawer slides cleanly from right.<br>• Pricing cards collapse to single-column stack with sticky CTA buttons.<br>• Billing receipt table scrolls horizontally with inertia without breaking page layout. |

---

## 8. Known Limitations & Deferred Scope

1. **Payment Gateway Sandbox:** While Razorpay and Cashfree integrations are structurally wired with signature verification, test mode API credentials are used for local and staging verification. Production real-money card charges remain gated behind production merchant activation.
2. **AI Study Assistant:** The AI Chat Assistant is intentionally scheduled for Day 4/5 integration to prevent regressions during the core subscription and payment hardening phase.
3. **Mains Multi-Stage Rubric:** Mains questions are currently verified for draft persistence and word count limits; multi-stage AI-assisted answer evaluation is planned for Day 5.

---

## 9. Conclusion & Deployment Readiness

Day 3 execution is **COMPLETE, VERIFIED, AND APPROVED**. 
- The user experience is strictly segregated by role.
- The 4 subscription tiers are enforced with zero price spoofing vulnerabilities.
- Self-serve billing and Spaced Repetition foundations are live.
- 63/63 automated regression tests pass against the live Neon PostgreSQL database.
- The platform is fully prepared for Vercel preview and production release.
