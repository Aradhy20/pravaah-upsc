# Pravaah UPSC — Master Implementation Plan for December 1 Launch
**Target Date:** 1 December 2026 (Controlled Beta Launch)  
**Execution Standard:** Zero Hallucination, Non-Destructive Database Operations, Academic Dignity  
**Target Architecture:** Next.js (App Router) + PostgreSQL (Prisma ORM) + Tailwind CSS + Vercel Serverless  

---

## 1. Plan Structure & Workstreams

```
+-----------------------------------------------------------------------------------+
|                        PRAVAAH UPSC DECEMBER 1 LAUNCH PLAN                         |
+-----------------------------------------------------------------------------------+
| Workstream 1: P0 Safety, Reliability & DB Resilience                              |
|   - Harden authentication (strictly gate CUID bypass to NODE_ENV===test)          |
|   - Enforce mandatory AUTH_SECRET in production                                   |
|   - Implement resilient schema drift self-healing for remote Neon tables          |
|   - Synchronize canonical pricing catalog & isolate Cashfree checkout (disabled)  |
+-----------------------------------------------------------------------------------+
| Workstream 2: Academic Content Integrity & Staging Promotion                      |
|   - Verify QuestionStagingRecord (2,052 structured questions)                     |
|   - Promote verified records with full booklet provenance & canonical options     |
|   - Expand published active bank from 121 to 2,173 verified questions             |
|   - Link NCERT foundation chapters to relevant questions                          |
+-----------------------------------------------------------------------------------+
| Workstream 3: End-to-End UPSC CSE Student Journey                                 |
|   - Onboarding & profile configuration (medium, optional subject, target year)   |
|   - Authentic PYQ exploration (bilingual toggle, official booklet metadata)       |
|   - Practice Tests & CSAT coach (timed mock mode, detailed answer sheets)         |
|   - Mains Writing evaluation with rubric-based feedback and structure analysis    |
|   - Spaced repetition revision queue wired to real student attempts               |
+-----------------------------------------------------------------------------------+
| Workstream 4: UI/UX Academic Transformation                                       |
|   - Calm scholarly palette: stone-50 canvas, stone-900 typography, teal accents   |
|   - Clean 8-item primary navigation architecture                                  |
|   - Homepage truth in metrics: dynamic verified counts, Controlled Beta badge     |
|   - Devanagari typography optimization (leading-relaxed, matra preservation)      |
+-----------------------------------------------------------------------------------+
| Workstream 5: Verification, QA & Launch Documentation                             |
|   - Full automated test suite (70+ tests passing, 0 regressions)                  |
|   - Zero compilation errors (`npx tsc --noEmit`) and clean `npm run build`        |
|   - Cross-browser smoke testing of all key student journeys                       |
|   - 15 launch verification reports delivered under docs/launch/                   |
|   - Final launch decision verdict: READY WITH LIMITATIONS (Controlled Beta)       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Detailed Workstream Execution Tasks

### Phase 1: P0 Safety & Reliability
- **T1.1 Authentication Hardening**:
  - Update `lib/auth.ts`: Ensure raw CUID token matching (`^cm[a-z0-9]+$`) is ONLY executed when `process.env.NODE_ENV === "test"`.
  - Require cryptographically signed HMAC SHA-256 session tokens in all other environments.
  - Throw clear runtime exceptions when `AUTH_SECRET` is unset in production.
- **T1.2 Neon Database Drift Mitigation**:
  - Inspect `scripts/deploy_db_setup.mjs` and ensure it creates `InterviewQuestion`, `MapFeature`, `UserUsageLedger`, and `MainsDraft` tables with exact Prisma schema constraints.
  - Implement a runtime database safety guard so queries to these tables handle missing relations gracefully or heal them dynamically without throwing HTTP 500 errors.
- **T1.3 Cashfree & Billing Posture**:
  - Set `ENABLE_PAYMENTS=false` across preview and production environments during the beta launch.
  - Ensure `/api/v1/plans` serves the canonical pricing structure (Plus ₹149/mo, Pro ₹299/mo, Elite ₹499/mo).

### Phase 2: Academic Content Integrity & Staging Promotion
- **T2.1 Staging Verification Gate**:
  - Run audit script to validate 2,052 staging records: check question text, 4 distinct options, valid correct option, and syllabus mapping.
- **T2.2 Safe Promotion Execution**:
  - Execute promotion script (`scripts/promote_verified_staging_questions.ts`) in non-destructive mode to move verified questions from `QuestionStagingRecord` to `Question`.
  - Validate that question bank count increases safely to 2,173 verified items.
- **T2.3 NCERT & Topic Linkage**:
  - Connect questions to foundational NCERT chapters and GS syllabus micro-themes.

### Phase 3: UPSC CSE Student Journey Unification
- **T3.1 Onboarding Flow**:
  - Ensure registration seamlessly flows to `/onboarding`, persisting target year, optional subject, and preferred medium.
- **T3.2 PYQ Explorer & CSAT Coach**:
  - Provide crisp filtering by Exam Year, Paper (GS1 / CSAT), Topic, and Difficulty.
  - Implement instant bilingual toggle (`EN | HI`) with explicit `TRANSLATION_PENDING` indicator where Hindi is not yet verified.
- **T3.3 Spaced Repetition Integration**:
  - Wire student question attempts to the SM-2 / Leitner spaced repetition engine under `/revision`.
- **T3.4 Mains Writing & Evaluation**:
  - Allow aspirants to type or submit answers, receiving structured rubric evaluation (Introduction, Arguments, Counterarguments, Way Forward, Conclusion).

### Phase 4: UI/UX Academic Transformation
- **T4.1 Color System & Aesthetic Restraint**:
  - Replace stark or oversaturated elements with calm academic stone palette (`bg-stone-50`, `text-stone-900`, `border-stone-200`, `accent-teal-700`).
- **T4.2 Navigation Simplification**:
  - Streamline sidebar to 8 high-priority destinations.
- **T4.3 Homepage Redesign**:
  - Display truthful metrics: "2,173+ Verified Authentic UPSC Questions", "Controlled Beta", "Series A Answer Key Reconciliation".
  - Add explicit "Report Academic Errata" link.

### Phase 5: QA Automation, Reports & Launch Decision
- **T5.1 Test Suite Validation**:
  - Run existing test suites plus any new regression tests for token security and staging promotion.
- **T5.2 Launch Reports Delivery**:
  - Deliver all 15 launch reports under `docs/launch/`.
- **T5.3 Formal Launch Verdict**:
  - Formal sign-off on release status.
