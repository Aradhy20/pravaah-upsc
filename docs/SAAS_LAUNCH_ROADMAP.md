# Pravaah UPSC — SaaS Launch & Technical Roadmap

**Document ID:** `DOC-ROADMAP-2026`  
**Execution Context:** Phased Commercial Launch & Technical Milestones  
**Date:** November 1, 2026  
**Author:** Principal SaaS Product Architect & DevOps Lead  
**Feature Branch:** `day3-saas-subscription`  

---

## 1. Roadmap Architecture & Guiding Principles

This roadmap transitions Pravaah UPSC from a feature-complete engineering milestone to an enterprise-grade, revenue-generating SaaS platform. 

### Guiding Principles:
1. **Preserve Working Workflows:** Never refactor working student journeys solely for architectural aesthetics.
2. **Fail Closed & Trust No Client:** Security and entitlement checks are strictly server-authoritative.
3. **Evidence-Based Advancement:** A milestone is declared complete only when backed by automated test suites and live database verification.
4. **Controlled Beta Precedes Live Billing:** Real student feedback must validate exam simulation stability before enabling production credit/debit card processing.

---

## 2. Phased Milestone Breakdown

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRAVAAH UPSC LAUNCH MILESTONES                                  │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬──────────────────┤
│ MILESTONE 1       │ MILESTONE 2       │ MILESTONE 3       │ MILESTONE 4       │ MILESTONE 5      │
│ Security & Data   │ SEO & Legal Trust │ AI Study Assistant│ Admin Moderation  │ Beta Launch &    │
│ Hardening         │ Hardening         │ Grounding         │ & Ingestion       │ Commercial GA    │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┼──────────────────┤
│ [COMPLETED - 4.1] │ [CURRENT FOCUS]   │ [DAY 5]           │ [DAY 6]           │ [DAY 7 & DAY 8]  │
│ • Sessions in DB  │ • sitemap.ts      │ • Source Grounding│ • Moderation Queue│ • 100-User Beta  │
│ • Scrypt Hashing  │ • robots.ts       │ • Verified PYQs   │ • CSV Batch Import│ • Live Gateway   │
│ • GS1/CSAT Split  │ • DPDP Compliance │ • Official Notices│ • Dispute Audit   │ • PR #1 Promotion│
│ • Subject Save    │ • OpenGraph Tags  │ • No Hallucination│ • Audit Logs      │ • Production GA  │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴──────────────────┘
```

---

## 3. Detailed Milestone Recommendations

### Milestone 1: Critical Security, Authentication & Analytics Hardening
* **Status:** **COMPLETED & VERIFIED (Sprint 4.1)**
* **Business Value:** Prevents horizontal privilege escalation, user impersonation, and corrupted learning statistics that would destroy aspirant trust before launch.
* **Engineering Changes:**
  - Implemented `model Session` in `prisma/schema.prisma` with 32-byte cryptographically secure random tokens and SHA-256 hashed database storage.
  - Upgraded password hashing to `scrypt` with unique per-password salts and transparent legacy migration.
  - Eliminated `x-user-id` and raw user IDs in Bearer headers.
  - Corrected GS1 vs. CSAT classification to eliminate double-counting.
  - Persisted study planner subjects and enforced server-side input schema validation.
* **Dependencies:** Neon Serverless PostgreSQL, Node.js `crypto`.
* **Acceptance Criteria:** Unauthenticated requests fail closed with HTTP 401; GS1 and CSAT metrics have 0 overlap; passwords verify via constant-time equality.
* **Testing Evidence:** 16 dedicated Day 4.1 automated tests passing (`tests/day4_1_*.test.mjs`), 85/85 full regression pass.

---

### Milestone 2: SEO, Public Discoverability & Legal Compliance
* **Status:** **SCHEDULED (Immediate Action Item)**
* **Business Value:** Drives zero-cost organic customer acquisition (organic Google search for specific UPSC PYQs) and establishes regulatory compliance under the Digital Personal Data Protection (DPDP) Act, 2023.
* **Engineering Changes:**
  1. Author `app/sitemap.ts` dynamically generating URLs for all 1,079 published Prelims PYQs, 9 subject hubs, and examination profiles.
  2. Author `app/robots.ts` permitting indexing of public educational routes while strictly disallowing private authenticated paths (`/dashboard/`, `/study-planner/`, `/admin/`, `/api/`).
  3. Configure `metadataBase`, `openGraph`, and `twitter` in `app/layout.tsx`.
  4. Expand `app/terms/page.tsx` and `app/privacy/page.tsx` with DPDP Act 2023 provisions (Data Fiduciary obligations, purpose limitation, user consent withdrawal, grievance redressal officer).
* **Dependencies:** Next.js Metadata API.
* **Acceptance Criteria:** `sitemap.xml` and `robots.txt` return HTTP 200; private dashboards return `noindex` directives; grievance contact (`grievance@pravaah.in`) rendered.
* **Testing Evidence:** Automated HTTP probe verifying sitemap and robots endpoints.

---

### Milestone 3: Source-Grounded AI Study Assistant & Intelligence (Day 5)
* **Status:** **SCHEDULED (Day 5 Roadmap)**
* **Business Value:** Delivers a high-margin premium feature (drives conversion to Achiever and Scholar plans) by answering student doubts 24/7 without risking factual hallucination.
* **Engineering Changes:**
  1. Build an authenticated AI chat endpoint (`/api/v1/assistant/chat`) gated by feature entitlement.
  2. Implement strict **Retrieval-Augmented Grounding (RAG)**: query context is restricted to Pravaah's 1,079 verified PYQ explanations, syllabus topic tags, and authoritative PIB/PRS summaries.
  3. Prohibit ungrounded open-ended web browsing or synthetic fact generation.
  4. Rate-limit and log queries for pedagogical review.
* **Dependencies:** Verified Question Bank, Server-Side Session Auth.
* **Acceptance Criteria:** AI responses cite official UPSC paper years and series keys; questions outside syllabus scope gracefully decline to answer; quota enforced by tier.
* **Testing Evidence:** Dedicated automated test suite validating grounding and tier access gates.

---

### Milestone 4: Administrative Moderation & Content Review Queue (Day 6)
* **Status:** **SCHEDULED (Day 6 Roadmap)**
* **Business Value:** Enables the academic team to ingest upcoming examination papers rapidly, review student-reported discrepancies, and verify explanations without direct SQL edits.
* **Engineering Changes:**
  1. Complete `/admin/review` UI displaying student discrepancy reports from `ContentReview`.
  2. Implement dual-key publication workflow for answer key corrections.
  3. Standardize batch CSV/JSON import with duplicate question detection.
  4. Record immutable audit logs in `AuditLog` for all administrative mutations.
* **Dependencies:** Admin RBAC middleware, Prisma `ContentReview` model.
* **Acceptance Criteria:** Non-admin callers receive HTTP 403; published questions cannot be overwritten without audit trail; CSV imports detect duplicates.
* **Testing Evidence:** Automated admin RBAC tests in `tests/security_auth_isolation.test.mjs`.

---

### Milestone 5: Controlled Beta Launch, Load Testing & Commercial Sign-Off (Day 7 & 8)
* **Status:** **SCHEDULED (Final Gate)**
* **Business Value:** Validates real student willingness to pay, identifies UX bottlenecks under real exam conditions, and ensures payment gateway integration meets Indian banking standards.
* **Engineering Changes:**
  1. Onboard 50–100 verified UPSC CSE aspirants in an invite-only beta cohort.
  2. Monitor timed exam autosave reliability and session submission latency.
  3. Transition `POST /api/v1/billing/checkout` from sandbox mock to live Razorpay/Stripe with raw-body HMAC SHA-256 webhook validation.
  4. Perform load test under concurrent question solving conditions (PgBouncer multiplexing).
  5. Merge Pull Request #1 into `main` after human approval.
* **Dependencies:** Live Payment Gateway Merchant Account, Vercel Production Environment.
* **Acceptance Criteria:** 0 exam autosave failures across 500+ student simulations; 0 security incidents; payment webhook activation succeeds with 100% idempotency.
* **Testing Evidence:** Beta sign-off report and live production smoke test logs.
