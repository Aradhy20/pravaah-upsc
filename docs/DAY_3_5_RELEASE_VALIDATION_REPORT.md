# PRAVAAH UPSC — Day 3.5 Release Validation Report
## Safely Deploy, Preview, Test and Approve the Day 3 Changes

**Document Status:** Release Validation & Staging Sign-Off  
**Author:** Antigravity AI Engineering (Senior Release Engineer, Vercel Deployment Engineer, QA Lead, SaaS Security Specialist)  
**Execution Date:** November 1, 2026  
**Target Milestone:** Public UPSC CSE Beta Release  
**Production Site:** `https://pravaah-upsc.vercel.app/`  
**Feature Branch:** `day3-saas-subscription`  
**Feature Commits:**
- `88740a2`: `feat(day3): complete professional saas experience, 4-tier subscription model, billing portal, anti-leak mock tests, and mistake journal`
- `66ea6ea`: `fix(day3.5): align cancellation policy disclosure and update registration target years to upcoming cycles`

---

## 1. Executive Summary & Release Status Recommendation

### Release Status: **PREVIEW VERIFIED**
The Day 3 implementation was successfully committed, pushed to GitHub on branch `day3-saas-subscription`, and built/deployed by Vercel's automated Git pipeline with deployment state **SUCCESS**.

All **63 regression tests (100% pass rate)** have been executed and verified against the live application and database. All 33 static and dynamic routes compile cleanly with zero TypeScript or lint errors.

In accordance with the **Strict Release Rule**, this release has been deployed exclusively as an isolated **Vercel Preview Deployment** protected by Vercel Authentication / SSO. No direct merges or force pushes to `main` have occurred.

---

## 2. Git State & Remote Tracking Verification

| Check | Specification Requirement | Measured Git State | Status |
| :--- | :--- | :--- | :---: |
| **Current Branch** | `day3-saas-subscription` | `day3-saas-subscription` | **VERIFIED** |
| **Working Tree** | Clean, zero uncommitted changes | `working tree clean` | **VERIFIED** |
| **Latest Commits** | `88740a2` and `66ea6ea` | `66ea6ea` (HEAD) on top of `88740a2` | **VERIFIED** |
| **Git Remote** | `origin` (`https://github.com/Aradhy20/pravaah-upsc.git`) | `origin` configured and accessible | **VERIFIED** |
| **Remote Branch Tracking** | Track `origin/day3-saas-subscription` | `branch 'day3-saas-subscription' set up to track 'origin/day3-saas-subscription'` | **VERIFIED** |
| **History Protection** | Zero force-push, zero rebase of main | Clean standard fast-forward push. `main` unmodified. | **VERIFIED** |

---

## 3. Vercel Project & Preview Deployment Configuration

| Attribute | Deployment Metadata |
| :--- | :--- |
| **Project Name** | `pravaah-upsc` |
| **Connected Git Repository** | `Aradhy20/pravaah-upsc` |
| **Production Branch** | `main` (Unchanged, pointing to stable baseline) |
| **Preview Branch** | `day3-saas-subscription` |
| **Commit SHA** | `66ea6ea511b4e5284751366a047c0b2510c295a2` |
| **Vercel Deployment ID** | `83WZca9QjzWXHtYYkonHexQP1pBg` |
| **Deployment State** | **`READY` / `success`** (Completed at `2026-11-01T03:13:14Z`) |
| **Target Preview URL** | `https://pravaah-upsc-git-day3-saas-subscription-aardhy-jains-projects.vercel.app` |
| **Deployment Security** | Vercel SSO Authentication Active (Prevents unauthorized public crawlers prior to production approval) |
| **Build Command** | `next build` (33 / 33 static and dynamic routes compiled cleanly) |

---

## 4. Production Database Protection Audit

A critical mandate of the Day 3.5 directive is the complete protection of existing user records, mock tests, attempts, notes, and subscriptions:

1. **Zero Database Migrations / Resets:**
   - No Prisma migration or `prisma db push --force-reset` was executed.
   - The authoritative 27 Prisma models and tables in Neon PostgreSQL (`ep-floral-cloud-b4pxc8uq`) remain intact.
2. **Customer Data Isolation:**
   - All regression tests utilize randomized, isolated tenant emails (e.g. `test_aspirant_${Date.now()}@pravaah.in`).
   - Cross-user data isolation verified: User A cannot read, mutate, or delete User B's bookmarks, notes, or active mock exam attempts.
3. **Payment Test Mode:**
   - Checkout sessions operate in sandbox/test mode.
   - Webhook processing mandates valid signatures and idempotency locks (`idempotencyKey`), preventing replay attacks and duplicate payment captures.

---

## 5. Authoritative Pricing & Subscription Reconciled

| Plan Tier | Tier Level | Billing Intervals | Verified Database Entitlements | Price Tamper Guard |
| :--- | :---: | :--- | :--- | :---: |
| **FREE** | Tier 0 | **₹0** (Lifetime) | • 15 PYQs/day<br>• 1 Mock test session<br>• Full explanations<br>• Daily 5-Q challenge | Server validates amount = ₹0 |
| **BEGINNER** | Tier 1 | **₹399** / month<br>**₹999** / quarter<br>**₹2,999** / year | • 50 PYQs/day<br>• 5 Mock tests/month<br>• Smart Mistake Journal<br>• Spaced revision queue | Server rejects client price tampering |
| **ACHIEVER** *(Flagship)* | Tier 2 | **₹799** / month<br>**₹1,899** / quarter<br>**₹5,499** / year | • Unlimited PYQs<br>• Unlimited Mock test series<br>• Deep CSAT diagnostics<br>• Spaced revision (1, 3, 7, 14 days) | Server rejects client price tampering |
| **SCHOLAR** | Tier 3 | **₹1,299** / month<br>**₹2,999** / quarter<br>**₹8,999** / year | • All Achiever entitlements<br>• Priority faculty review queue<br>• Mains answer writing workspace | Server rejects client price tampering |

### Key Policy Adjustments Made in Day 3.5:
1. **Refund Policy Alignment:**
   - *Audit Finding:* Day 3 briefly included a promotional "7-Day Unconditional Money-Back Guarantee". An audit of backend systems revealed no automated merchant refund pipeline or bank reversal integration.
   - *Correction Applied:* Removed the unsupported refund promise from `app/pricing/page.tsx` and test assertions. Replaced with accurate, legally sound disclosures:
     - **Transparent Cancellation & Fair Access:** "Cancel anytime directly from your billing dashboard. When cancelled, paid access is preserved until the conclusion of your current billing cycle with zero renewal charges."
2. **Dynamic Target Exam Year Selector:**
   - *Audit Finding:* Hardcoded options included 2025 (which is in the past) and 2026 (already concluded).
   - *Correction Applied:* Made target year selector dynamic based on `new Date().getFullYear()`, providing upcoming active exam cycles:
     - `2027 (Target Attempt)`
     - `2028 (Next Cycle)`
     - `2029 (Two-Year Foundation)`
     - `2030 (Long-Term Foundation)`

---

## 6. End-to-End Customer Journey Verification

| Customer Journey | Flow Tested | Test Mechanism | Outcome |
| :--- | :--- | :--- | :---: |
| **Journey A (New Visitor Free)** | `/pricing` → Select Free → `/register` → `/dashboard` → `/pyqs` | Automated test + Browser subagent | **PASS (HTTP 200/201)** |
| **Journey B (New Visitor Paid)** | `/pricing` → Select Achiever Annual → `/register?plan=ACHIEVER&interval=ANNUAL` → Checkout → Webhook Verification → Active Subscription | `tests/day3_subscription_journey.test.mjs` | **PASS (HTTP 200)** |
| **Journey C (Existing Aspirant)** | `/login` → `/dashboard` → `/pyqs` (Learn Mode) → Incorrect Answer → Tag Mistake (`Concept not clear`) → `/revision` Queue | Browser subagent + API routes | **PASS (HTTP 200)** |
| **Journey D (Administrator)** | `/login` → `/admin` → `/admin/subscriptions` & `/admin/coverage` | `tests/day3_user_experience.test.mjs` | **PASS (HTTP 200 / RBAC 403 for aspirants)** |
| **Journey E (Mock Examination)** | `/mock-tests` → Select 2024 GS1 Mini Simulation → Start Exam → Answer Q1 (C) & Q2 (A) → Autosave → Submit Paper → Scorecard (+4 marks, 100% accuracy) | Browser subagent (`exam_flow_capture`) | **PASS (Verified with video & screenshots)** |
| **Journey F (Payment Failure/Retry)** | Invalid card token or gateway timeout triggers pending/failed state without granting entitlements; user retries | `tests/pricing_subscriptions.test.mjs` | **PASS (Anti-spoof verified)** |
| **Journey G (Self-Serve Cancellation)** | Aspirant requests cancellation via `/api/v1/billing/cancel`; `cancelAtPeriodEnd: true`; access preserved until `currentPeriodEnd` | `tests/day3_subscription_journey.test.mjs` | **PASS (Preserved access verified)** |

---

## 7. Visual Acceptance & Responsive Layout Verification

Visual audits conducted across 3 standard viewports confirmed:

1. **Header Layout & Navigation:**
   - Brand logo "Pravaah UPSC" remains on a single line with SVG graduation cap/book icon.
   - Clean single-line desktop navigation with 6 essential links.
   - Administrator badge and Sign Out button cleanly isolated with zero role bleed.
   - Aspirant subscription badge (`Free` / `Prelims Pro`) sits beside user profile menu.
   - Zero horizontal overflow (`overflow-x: hidden`), no overlapping elements.
2. **Device Viewport Compatibility:**
   - **Desktop (1440px):** 4-tier pricing grid renders side-by-side with equal-height feature cards.
   - **Tablet (768px):** 2x2 grid collapses smoothly with legible typography.
   - **Mobile (390px):** Single-column stacked layout with mobile hamburger navigation sliding from right.

---

## 8. Automated Test Summary: 63 / 63 Passed (100%)

```text
> node --test tests/*.test.mjs

✔ Database Integrity: Questions and Official Answer Keys exist
✔ Filter Integrity: GS1 vs GS2 separation
✔ Security & Anti-Leak: Options payload for Exam Session does not leak answers
✔ Admin Guardrail: Direct publication from DRAFT must be rejected
✔ User Bookmarking & Notes Relational Persistence
✔ GET /api/v1/current-affairs returns published stories with linked PYQs
✔ GET /api/v1/current-affairs/[slug] returns full story with connected historical PYQ
✔ GET /api/v1/quiz/daily returns today's 5-question Prelims quiz with redacted answers
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

ℹ tests 63 | pass 63 | fail 0 | cancelled 0 | skipped 0
```

---

## 9. Remaining Operational Items & Production Release Recommendation

### Production Release Recommendation: **READY FOR STAKEHOLDER APPROVAL**
All technical criteria, security guardrails, test assertions, and build verifications have been satisfied.

### Checklist Before Merging to `main` for Production Release:
1. **Gateway Production Keys:** Ensure Razorpay/Cashfree live credentials and webhook secret are configured in Vercel Production Environment Variables when ready to take real payments.
2. **Vercel Preview Promotion:** The team can review the live preview at `https://pravaah-upsc-git-day3-saas-subscription-aardhy-jains-projects.vercel.app`.
3. **Merge Procedure:** Upon user approval, merge `day3-saas-subscription` into `main` to trigger the production Vercel deployment.
