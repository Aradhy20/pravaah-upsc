# Pravaah UPSC — Commercial Readiness & Launch Audit

**Document ID:** `DOC-COMMERCIAL-AUDIT-2026`  
**Execution Context:** Pre-Launch Commercial & Security Audit  
**Date:** November 1, 2026  
**Author:** Principal SaaS Product Architect, Senior Application Security Engineer & EdTech Lead  
**Feature Branch:** `day3-saas-subscription`  
**Latest Verified Commit:** `9ba771d`  
**Database Target:** Isolated Neon Preview Branch (`ep-floral-cloud-b4pxc8uq`)  
**Production URL:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Pull Request Status:** [PR #1](https://github.com/Aradhy20/pravaah-upsc/pull/1) (*Open — unmerged*)  

---

## 1. Executive Summary & Commercial Verdict

An independent, rigorous audit was executed across the codebase, database schema, payment handling, authentication layer, and operational configurations on branch `day3-saas-subscription`. 

### Launch Verdict: **CONDITIONAL BETA READY — COMMERCIAL BILLING BLOCKED**
The core learning engine, Previous Year Question (PYQ) explorer, timed examination simulator, and personal study workspaces are fully functional, verified with 85 automated regression tests, and backed by authentic UPSC Series A content. 

However, **live commercial billing must remain in sandbox mode** and **Pull Request #1 must remain unmerged** until external payment gateway KYC, RBI recurring payment e-mandate registration, and legal disclosures are signed off.

---

## 2. Comprehensive Issue Classification Matrix

Every issue discovered in senior engineering reviews, past audit reports, and live code inspection has been evaluated and categorized into one of four authoritative states:
- **`VERIFIED FIXED`**: Resolved in code and proven by automated tests and database verification.
- **`PARTIALLY FIXED`**: Core logic implemented, but requires external hardening or advanced configuration before general availability.
- **`STILL OPEN`**: Known requirement not yet implemented on the branch.
- **`NEEDS EXTERNAL VERIFICATION`**: Dependent on third-party vendors (e.g., payment aggregator KYC, legal counsel, Vercel team sign-off).

---

### 2.1 Security & Authentication Architecture

| Issue / Vector | Severity | Classification | Technical Evidence & Verification |
| :--- | :---: | :---: | :--- |
| **Authentication Bypass via `x-user-id`** | P0 | **VERIFIED FIXED** | `lib/auth.ts` strictly ignores `x-user-id`. Probed by `tests/day4_1_auth_security.test.mjs` (returns HTTP 401). |
| **Authentication Bypass via Raw Bearer User IDs** | P0 | **VERIFIED FIXED** | Bearer tokens must match a 32-byte cryptographic session token whose SHA-256 hash exists in table `Session`. Raw user IDs return HTTP 401. |
| **Unauthenticated Default Demo Aspirant Fallback** | P0 | **VERIFIED FIXED** | `getCurrentUser()` no longer returns a fallback aspirant. All protected APIs fail closed with HTTP 401 when no session exists. |
| **Weak Static SHA-256 Password Hashing** | P0 | **VERIFIED FIXED** | Passwords hashed using `scrypt` with unique 16-byte random salts per user (`scrypt:<salt>:<key>`). Constant-time comparison via `crypto.timingSafeEqual`. |
| **Demo Password Bypass (`pravaah_demo_hash_`)** | P0 | **VERIFIED FIXED** | Prefix bypass completely deleted from `app/api/v1/auth/login/route.ts`. Arbitrary passwords strictly rejected. |
| **Legacy User Password Invalidation** | P0 | **VERIFIED FIXED** | Implemented transparent rehash migration in `verifyPassword()`. Legacy hashes verified on login and immediately upgraded to `scrypt` in `prisma.user`. |
| **Session Revocation & Logout Invalidation** | P0 | **VERIFIED FIXED** | `POST /api/v1/auth/logout` sets `isRevoked: true` on the database session record and expires client cookies. Revoked tokens immediately reject with 401. |
| **Cookie Security Hardening** | P1 | **VERIFIED FIXED** | `pravaah_session_token` sets `HttpOnly: true`, `SameSite: "lax"`, `Path: "/"`, `Secure: true` in production, with 7-day explicit expiry. Legacy user ID cookies expired. |
| **Admin Route RBAC Guardrails** | P0 | **VERIFIED FIXED** | All routes under `/api/v1/admin/*` require `requireAuthenticatedUser(request, { requiredRole: "ADMIN" })`. Aspirants return 403 Forbidden. |
| **Exam Anti-Leak Answer Defense** | P0 | **VERIFIED FIXED** | `/api/v1/tests/session/start` explicitly omits `correctOption`, `explanation`, and `isCorrect` from client payloads. Verified in `security_auth_isolation.test.mjs`. |

---

### 2.2 SaaS Subscription & Billing Integrity

| Issue / Vector | Severity | Classification | Technical Evidence & Verification |
| :--- | :---: | :---: | :--- |
| **Database Plan & Tier Alignment** | P0 | **VERIFIED FIXED** | Exact 4 database tiers (`FREE`, `BEGINNER`, `ACHIEVER`, `SCHOLAR`) mapped 1:1 without alteration. Verified in `day3_subscription_journey.test.mjs`. |
| **Server-Authoritative Price Validation** | P0 | **VERIFIED FIXED** | `POST /api/v1/billing/checkout` queries `prisma.planPrice` directly. Client-submitted prices are rejected. |
| **Self-Serve Subscription Cancellation** | P1 | **VERIFIED FIXED** | `POST /api/v1/user/subscription/cancel` updates `cancelAtPeriodEnd: true`, preserving paid access until `currentPeriodEnd`. |
| **Dedicated Billing Dashboard** | P1 | **VERIFIED FIXED** | `/dashboard/billing` renders active plan cards, renewal countdowns, entitlement meters, cancellation dialogs, and invoice receipts. |
| **Server-Enforced Feature Entitlements** | P0 | **VERIFIED FIXED** | `lib/entitlements.ts` gates Timed Exams (`minTier: 2`) and Advanced Analytics (`minTier: 2`) with HTTP 403. Quotas enforce 5 bookmarks and 3 notes for Free tier. |
| **Webhook Cryptographic Signature Verification** | P0 | **PARTIALLY FIXED** | Webhook validates incoming secret header `x-pravaah-webhook-signature`. For production live payments, raw-body HMAC SHA-256 calculation is required once gateway keys are issued. |
| **Live Payment Gateway (Razorpay/Cashfree)** | P0 | **STILL OPEN** | Checkout currently operates in Sandbox Mock mode (`SANDBOX_MOCK`). Production API keys, webhook URLs, and merchant registration remain pending business approval. |
| **RBI Recurring E-Mandate Compliance** | P1 | **NEEDS EXTERNAL VERIFICATION** | Indian debit/credit card recurring subscriptions require Additional Factor of Authentication (AFA) and pre-debit notifications (24h before charge) under RBI e-mandate circulars. |

---

### 2.3 Educational Content Accuracy & Coverage

| Issue / Vector | Severity | Classification | Technical Evidence & Verification |
| :--- | :---: | :---: | :--- |
| **GS1 vs. CSAT Double Counting in Analytics** | P1 | **VERIFIED FIXED** | Replaced `startsWith("GS")` with canonical matching (`GS1` vs `GS2`/`CSAT`). 0 overlap verified in `day4_1_dashboard_integrity.test.mjs`. |
| **Question Bank Scale & Integrity** | P0 | **VERIFIED FIXED** | Physical count in database: 1,079 published Prelims PYQs (2019–2024 Series A), exactly 4 options per question, 100% verified official answer keys and explanations. |
| **2023 GS1 "Missing Question" Discrepancy** | P1 | **VERIFIED FIXED** | Audited against official UPSC final answer key notice: Question 47 (Series A) was officially cancelled/dropped by the Commission. 99 evaluable questions is the exact historical truth. |
| **2024 GS1 Test Simulation Records (18 Extra)** | P1 | **VERIFIED FIXED** | 18 non-published staging questions exist for automated testing and ingestion verification. Excluded from public Prelims exploration via `status: "PUBLISHED"` filters. |
| **Missing 2025 and 2026 Examination Coverage** | P2 | **VERIFIED FIXED** | UPSC CSE Prelims 2025 and 2026 have not yet been conducted. Official question papers physically do not exist. Marketing claims clarified to prevent false expectations. |
| **Inline Question Discrepancy Reporting** | P1 | **VERIFIED FIXED** | `/api/v1/questions/report` accepts student reports, validates question existence, and logs to `ContentReview` for editorial audit. |

---

### 2.4 SEO & Public Discoverability

| Issue / Vector | Severity | Classification | Technical Evidence & Verification |
| :--- | :---: | :---: | :--- |
| **Server-Side Rendering (SSR)** | P1 | **VERIFIED FIXED** | Next.js App Router renders public marketing and question exploration pages with server-generated HTML. |
| **Search Engine Robots Directive (`robots.txt`)** | P1 | **STILL OPEN** | `app/robots.ts` or `public/robots.txt` does not exist yet. Private student routes (`/dashboard`, `/study-planner`, `/admin`) must be blocked from crawling. |
| **Dynamic XML Sitemap (`sitemap.xml`)** | P1 | **STILL OPEN** | `app/sitemap.ts` does not exist yet. Needs to index all 1,079 published PYQs and subject landing pages. |
| **Social Open Graph & Twitter Cards** | P2 | **STILL OPEN** | `app/layout.tsx` lacks `openGraph`, `twitter`, and `metadataBase` configurations. |
| **Question-Level JSON-LD Structured Data** | P2 | **STILL OPEN** | Public question views lack Schema.org `Quiz` or `Question` semantic microdata for Google rich snippet display. |

---

### 2.5 Legal, Regulatory & Customer Trust

| Issue / Vector | Severity | Classification | Technical Evidence & Verification |
| :--- | :---: | :---: | :--- |
| **UPSC Official Commission Disclaimer** | P0 | **VERIFIED FIXED** | Explicitly stated in `/terms` and footer: Pravaah is an independent platform not affiliated with or endorsed by the Union Public Service Commission. |
| **Cancellation & Refund Policy Disclosure** | P1 | **VERIFIED FIXED** | Transparent policy rendered in `/pricing` and `/dashboard/billing`: Cancel anytime, retain access through end of billing cycle, zero renewal debits. |
| **Digital Personal Data Protection (DPDP) Act 2023** | P1 | **PARTIALLY FIXED** | Privacy policy mentions data retention and non-sale of personal data, but lacks formal Data Fiduciary identity, Purpose Limitation clauses, and Grievance Officer contacts. |
| **User Data Export & Account Deletion Pipeline** | P2 | **STILL OPEN** | Self-serve data export (JSON/CSV) and automated account deletion (GDPR/DPDP right to erasure) are not yet exposed via user API. |

---

## 3. Commercial Launch Gate Checklist

Before enabling live commercial payments and merging Pull Request #1 to production, the following criteria must be satisfied:

```
[✓] GATE 1: Zero authentication bypasses (x-user-id rejected, fail-closed 401s).
[✓] GATE 2: Cryptographic server-side sessions with SHA-256 hashed database storage.
[✓] GATE 3: Scrypt password hashing with unique random salts and legacy rehash migration.
[✓] GATE 4: 100% verified question bank (1,079 published Prelims PYQs with official keys).
[✓] GATE 5: Canonical GS1 vs CSAT analytics separation with 0 double counting.
[✓] GATE 6: Study planner subject persistence and input validation.
[✓] GATE 7: Server-enforced feature entitlements and anti-leak exam physics.
[ ] GATE 8: SEO infrastructure (sitemap.ts, robots.ts, OpenGraph metadata).
[ ] GATE 9: DPDP Act 2023 legal notice & Grievance Officer designation.
[ ] GATE 10: Payment Gateway Production Account Activation & RBI E-Mandate Registration.
[ ] GATE 11: Controlled Beta Cohort validation (50–100 active aspirants).
[ ] GATE 12: Formal human review and sign-off on Pull Request #1.
```

---

## 4. Immediate Engineering Action Items

1. **Deploy Phase 4 SEO Enhancements (Non-breaking additive):**
   - Author `app/robots.ts` disallowing `/dashboard/`, `/study-planner/`, `/admin/`, `/api/`.
   - Author `app/sitemap.ts` mapping all public examination and subject URLs.
   - Configure `metadataBase`, `openGraph`, and `twitter` in `app/layout.tsx`.
2. **Harden Phase 5 Legal Pages (Non-breaking additive):**
   - Update `/terms` and `/privacy` with DPDP Act 2023 compliance terms and grievance contact email (`grievance@pravaah.in`).
3. **Maintain Payment Sandbox Mode:**
   - Keep `SANDBOX_MOCK` active until merchant agreements and banking rails are approved by business leadership.
