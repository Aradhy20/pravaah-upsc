# Pravaah UPSC — 100-Aspirant Beta Launch Plan & Operational Runbook

**Document ID:** `DOC-BETA-PLAN-2026`  
**Execution Context:** Controlled Beta Cohort & Operational Readiness  
**Target Date:** November 2026 – December 2026  
**Author:** Principal SaaS Product Architect, QA Lead & EdTech Product Manager  
**Feature Branch:** `day3-saas-subscription`  

---

## 1. Executive Summary & Objective

Before launching commercial paid billing to the public UPSC preparation market, Pravaah UPSC will execute an invite-only **Controlled Beta Program** with 50 to 100 active civil services examination aspirants.

### Core Objectives:
1. **Validate Real-World Simulator Reliability:** Prove that timed mock tests and full-length PYQ simulations execute with 100% autosave reliability and zero data loss across mobile, tablet, and desktop viewports.
2. **Stress-Test Data Integrity & Learning Analytics:** Verify that question attempt records, cognitive error classifications, subject performance splits, and spaced revision intervals update cleanly under continuous daily student use.
3. **Calibrate Academic Content Trust:** Measure student confidence in question explanations, verify that official UPSC answer keys match student expectations, and field-test the student discrepancy reporting mechanism.
4. **Evaluate Willingness to Pay & Plan Conversion:** Track pricing perception, feature entitlement satisfaction, and sandbox checkout conversions to calibrate the four SaaS subscription tiers before opening live payment rails.

---

## 2. Beta Cohort Composition & Recruitment Matrix

To ensure realistic, diverse feedback across the preparation spectrum, the 100 beta participants are drawn from three distinct, high-value cohorts:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BETA COHORT COMPOSITION (N = 100)                         │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ COHORT A: THE REPEATERS       │ COHORT B: WORKING PROS        │ COHORT C: FIRST-TIMERS │
│ (35 Aspirants)                │ (35 Aspirants)                │ (30 Aspirants)         │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • 2+ Prelims attempts         │ • Working 8-10 hrs/day        │ • College final year / │
│ • Missed cutoff by < 10 marks │ • Weekend & late-night study  │   fresh graduates      │
│ • Focus: Timed Simulation,    │ • Focus: Study Planner,       │ • Focus: Core Concepts,│
│   Negative Marking Physics,   │   Mobile responsiveness,      │   Explanations,        │
│   Mistake Journal             │   Quick Diagnostic Analytics  │   Subject-wise PYQs    │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### Recruitment Channels & Screening Criteria:
- **Screening Questionnaire:** Verification of target year ($2026$ or $2027$), optional subject, past attempt history, and weekly study hours committed ($\ge 10\text{ hours/week}$).
- **Participant Agreement:** Agreement to complete at least 2 full-length timed tests, record at least 50 individual PYQ attempts weekly, and submit weekly feedback surveys.
- **Incentive:** Complimentary 6-month access to the **Scholar (All-Access Pass)** tier upon completion of the 4-week program.

---

## 3. Four-Week Phased Beta Execution Timeline

```
┌──────────────┬─────────────────────────────────────────────────────────────────────────┐
│ WEEK         │ FOCUS & KEY ACTIVITIES                                                  │
├──────────────┼─────────────────────────────────────────────────────────────────────────┤
│ Week 1       │ Onboarding & Baseline Diagnostic (Days 1–7)                             │
│              │ • Account registration and initial goal setup ($2026/2027$)             │
│              │ • Baseline diagnostic test (100-question GS1 2024 simulation)            │
│              │ • Initial telemetry & login session stability audit                     │
├──────────────┼─────────────────────────────────────────────────────────────────────────┤
│ Week 2       │ Topic-Wise Practice & Mistake Journaling (Days 8–14)                    │
│              │ • Intensive subject filtering (Polity, Economy, Environment)            │
│              │ • Option strike-through and question bookmarking stress test            │
│              │ • Cognitive error tagging (`Concept not clear`, `Misread question`, etc.)│
├──────────────┼─────────────────────────────────────────────────────────────────────────┤
│ Week 3       │ Spaced Revision & Study Planning (Days 15–21)                           │
│              │ • Automated mistake rescheduling validation at Day 1, 3, and 7 intervals │
│              │ • Study planner target adherence and daily minutes tracking             │
│              │ • CSAT paper simulation and 33% qualifying cutoff validation            │
├──────────────┼─────────────────────────────────────────────────────────────────────────┤
│ Week 4       │ Pricing, Sandbox Checkout & Exit Survey (Days 22–28)                    │
│              │ • Sandbox subscription checkout flow simulation (all 4 tiers)           │
│              │ • Customer Satisfaction (CSAT) and Net Promoter Score (NPS) audit       │
│              │ • Final exit interview with top 15 power users                          │
└──────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Telemetry, Error Reporting & Instrumentation

The beta deployment integrates proactive, privacy-respecting client and server telemetry to capture anomalies before users report them:

### 4.1 Automated Health Telemetry:
1. **Exam Autosave Reliability:**
   - Every selection change in `MockExamEngine` emits an asynchronous save to `/api/v1/mock-tests/[testId]`.
   - The client monitors response latency ($T_{\text{save}}$). If $T_{\text{save}} > 2000\text{ms}$ or fails, an in-memory queue retries with exponential backoff and visually indicates network connectivity status.
2. **Session Integrity & Expiration:**
   - Auth middleware monitors `pravaah_session_token` validation. Zero 500 errors permitted; seamless session refreshment.
3. **Discrepancy Reporting Pipeline:**
   - Every question card features a "Flag / Report Discrepancy" action that posts to the `ContentReview` model with specific dispute categories:
     - `TYPO_OR_FORMATTING`
     - `EXPLANATION_CLARITY`
     - `OFFICIAL_KEY_QUERY`
     - `SOURCE_CITATION_REQUEST`
   - Reports automatically route to the administrative queue (`/admin/review`).

---

## 5. Quantitative Beta Exit Criteria (Launch Gates)

To promote the application from Beta to General Availability (Commercial GA), the platform must meet all seven quantitative thresholds without exception:

| Metric | Target Threshold | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Exam Simulation Reliability** | $\ge 99.9\%$ completed with 0 data loss | Telemetry logs across $\ge 500$ completed mock tests | **GATE 1** |
| **Autosave Failure Rate** | $\le 0.1\%$ of all response mutations | Server-side API error log monitor | **GATE 2** |
| **Security Incidents** | **Zero (0)** P0/P1 security vulnerabilities | Static analysis, penetration test & auth boundary audit | **GATE 3** |
| **Question Bank Discrepancy Rate**| $\le 0.5\%$ disputed questions | Content review queue audit ($< 6$ unresolved flags) | **GATE 4** |
| **App Performance (P95 Latency)**| $\le 800\text{ms}$ for question queries | Vercel Analytics / server timing headers | **GATE 5** |
| **Customer Satisfaction (CSAT)** | $\ge 4.4 / 5.0$ overall rating | Week 4 cohort exit survey ($N \ge 80$ responses) | **GATE 6** |
| **Sandbox Checkout Conversion**   | $\ge 8.0\%$ opt-in rate for paid tiers | Sandbox checkout events logged in `Subscription` table | **GATE 7** |

---

## 6. Operational Support Runbook & SLAs

During the 4-week beta, the technical and academic teams will operate under strict Service Level Agreements (SLAs):

```
┌─────────────────┬───────────────────┬───────────────────┬────────────────────────────────┐
│ SEVERITY LEVEL  │ DEFINITION        │ FIRST RESPONSE    │ RESOLUTION SLA                 │
├─────────────────┼───────────────────┼───────────────────┼────────────────────────────────┤
│ P0 — Critical   │ Data loss, auth   │ < 15 minutes      │ < 2 hours (Hotfix release)     │
│                 │ failure, site down│                   │                                │
├─────────────────┼───────────────────┼───────────────────┼────────────────────────────────┤
│ P1 — High       │ Exam autosave lag,│ < 1 hour          │ < 6 hours                      │
│                 │ analytics desync  │                   │                                │
├─────────────────┼───────────────────┼───────────────────┼────────────────────────────────┤
│ P2 — Medium     │ Question key flag,│ < 4 hours         │ < 24 hours (Academic review)   │
│                 │ explanation typo  │                   │                                │
├─────────────────┼───────────────────┼───────────────────┼────────────────────────────────┤
│ P3 — Low        │ Feature request,  │ < 12 hours        │ Evaluated for next sprint      │
│                 │ UI polish         │                   │                                │
└─────────────────┴───────────────────┴───────────────────┴────────────────────────────────┘
```

### Escalation & Communication Flow:
- **Dedicated Private Community:** Telegram / WhatsApp private group for real-time announcements, daily tips, and immediate issue reporting.
- **Support Inbox:** `support@pravaah.in` monitored 16 hours/day by dedicated technical support.
- **Academic Review Lead:** Immediate verification against official UPSC archival gazettes for any question flagged by $> 2$ students.

---

## 7. Commercial Transition & Production Cutover

Upon satisfying all seven exit gates:
1. **Merchant Account Verification:** Complete Razorpay/Stripe live KYC, webhook signing key installation, and UPI AutoPay mandate compliance.
2. **Feature Branch Promotion:** Final human review and merge of Pull Request #1 (`day3-saas-subscription` $\rightarrow$ `main`).
3. **Production Smoke Test:** Execute zero-downtime deployment on `pravaah-upsc.vercel.app`, verifying that all 1,079 published PYQs, user dashboards, and payment webhooks function seamlessly in production.
4. **Cohort Conversion Offer:** Beta participants receive a special founder's discount code (50% off first renewal after their complimentary 6 months).
