# PRAVAAH UPSC — MASTER GAP REGISTER & RISK INVENTORY

**Audit Date:** November 28, 2026  
**Auditor:** Principal Software Architect & QA Automation Lead  
**Scope:** Exhaustive Inventory of All Discovered Bugs, Missing Workflows, Broken Integrations & Data Gaps  
**Prioritization Standard:** P0 (Production Blocker), P1 (Essential Core), P2 (Content & Learning), P3 (Retention), P4 (Expansion)  

---

## 1. P0 — Critical Production Blockers (Fix Immediately)

| Gap ID | Issue & Failure Manifestation | Business & Technical Impact | Affected Modules | Root Cause & Recommended Fix | Effort (Days) | Risk |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **P0-1** | **Cashfree Order Creation Fails (`HTTP 500`)**<br>Live checkout returns `ORDER_CREATION_FAILED - authentication Failed`. | **Zero Revenue Collection:** No student can purchase subscriptions. | `app/api/v1/payments/create-order/route.ts`<br>`lib/payments/payment-config.ts` | Cashfree production key (`cfsk_ma_prod_...`) is routed to Cashfree sandbox endpoint because `CASHFREE_ENVIRONMENT` is unset or sandbox on Vercel. Set `CASHFREE_ENVIRONMENT=PROD` in Vercel settings. | **0.5** | Low |
| **P0-2** | **Production Database Table Drift (Neon `42P01`)**<br>`/api/v1/map-lab`, `/api/v1/interview`, and `/api/v1/mains/evaluate` crash on live prod. | **4 Broken Student Routes:** Interactive map lab, interview simulator, and Mains evaluator are unusable. | PostgreSQL remote Neon cluster<br>`prisma/schema.prisma` | Remote Neon database was never migrated with the 3 newest tables (`MapFeature`, `InterviewQuestion`, `UserUsageLedger`). Execute `npx prisma migrate deploy` targeting remote Neon `DATABASE_URL`. | **0.5** | Low |
| **P0-3** | **Universal Search Crash on Prod (`HTTP 500`)**<br>Submitting any search query in the header search bar fails. | **Broken Navigation:** Students cannot discover questions, videos, or glossary terms. | `app/api/v1/search/route.ts` | Search route executes parallel multi-domain queries across `MapFeature` and `InterviewQuestion`. Fixed automatically once P0-2 tables are created. | **0.2** | Low |
| **P0-4** | **Pricing Catalog Disconnect on Live Prod**<br>`/api/v1/plans` returns legacy ₹399/₹799/₹1,299 prices instead of canonical ₹149/₹299/₹499. | **Financial Misalignment & Trust Loss:** Student sees one price on cards, another at checkout. | PostgreSQL `SubscriptionPlan`<br>`scripts/seed_monetization_plans.mjs` | Remote database contains stale price rows. Execute canonical plan re-seeding against production database. | **0.5** | Low |

---

## 2. P1 — Essential Product Functionality (Pre-Launch Mandates)

| Gap ID | Issue & Failure Manifestation | Business & Technical Impact | Affected Modules | Root Cause & Recommended Fix | Effort (Days) | Risk |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **P1-1** | **Question Bank Content Starvation (121 Qs)**<br>Published bank contains only 121 questions (students run out in 3 days). | **Immediate Student Churn:** Platform cannot support sustained multi-month preparation. | `Question` table<br>`QuestionStagingRecord` table | 2,052 verified questions exist in staging but have not been promoted to `Question`. Execute `scripts/promote_verified_staging_questions.ts` to expand bank to 2,173 Qs. | **1.0** | Med |
| **P1-2** | **Static Current Affairs Pipeline**<br>56 static articles seeded weeks ago; publication dates are null; no daily updates. | **Platform Stagnation:** Current affairs is a daily necessity for aspirants. | `app/api/v1/current-affairs/route.ts`<br>`app/api/v1/cron/daily-ingest/route.ts` | No active automated cron crawler. Connect Vercel Cron or GitHub Action to harvest daily PIB Delhi press releases at 06:00 IST. | **2.0** | Med |
| **P1-3** | **Daily Quiz Repetition Loop**<br>Daily quiz pulls from the same static 121 questions; repeats questions every 2 weeks. | **Low Engagement:** Daily active users stop opening the app. | `app/api/v1/quiz/daily/route.ts` | Ingest fresh daily 5-question batches derived from current affairs and NCERT chapters. | **1.5** | Low |
| **P1-4** | **Unrestricted Test ID Bypass in Auth**<br>`lib/auth.ts` allows any string matching `^cm[a-z0-9]+$` to authenticate without HMAC signature. | **Security Hole:** Attacker guessing a user's CUID could impersonate their account. | `lib/auth.ts` (Lines 54–57) | Restrict the raw CUID bypass strictly to `process.env.NODE_ENV === "test"`. | **0.2** | Low |

---

## 3. P2 — Content & Learning Completeness

| Gap ID | Issue & Failure Manifestation | Business & Technical Impact | Affected Modules | Root Cause & Recommended Fix | Effort (Days) | Risk |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **P2-1** | **NCERT Linkage Void (Only 2 Linked Qs)**<br>9 books and 44 chapters exist, but only 2 questions are interactive. | **Broken Early Aspirant Experience:** School students find an empty directory instead of practice. | `NCERTChapterQuestionLink`<br>`app/ncert/page.tsx` | Batch map NCERT chapter curriculum nodes to foundational UPSC Prelims questions in `prisma.nCERTChapterQuestionLink`. | **3.0** | Low |
| **P2-2** | **Bilingual Deficit (80 Qs Lack Hindi)**<br>80 of 121 published questions are English-only (`TRANSLATION_MISSING`). | **Alienates UP Board / Hindi Medium:** Hindi students cannot take complete mock papers in Hindi. | `Question` table (`questionTextHi`) | Cross-reference with official UPSC Hindi question paper gazettes and update `questionTextHi` and `optionTextHi`. | **2.5** | Low |
| **P2-3** | **Limited Mock Test Presets (Only 3 Presets)**<br>Students can only take 3 pre-configured mock tests. | **Mock Exam Fatigue:** Aspirants need at least 15–20 full-length 100-question mock exams. | `TestSession`<br>`app/mock-tests/page.tsx` | Ingest full 100-question Series A papers for 2019, 2020, 2021, 2022, 2023, and 2024. | **2.0** | Low |
| **P2-4** | **Inactive Mistake Classification Table**<br>`UserMistakeClassification` table has 0 rows; mistake notebook is partially stubbed. | **Weak Spaced Repetition:** Students cannot filter mistakes by "Conceptual Error" vs "Silly Mistake". | `UserMistakeClassification`<br>`app/revision/page.tsx` | Populate mistake classification during `tests/session/submit` when student picks an incorrect option. | **1.5** | Low |

---

## 4. P3 — Monetization & Retention Improvements

| Gap ID | Issue & Failure Manifestation | Business & Technical Impact | Affected Modules | Root Cause & Recommended Fix | Effort (Days) | Risk |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **P3-1** | **Absence of Rate Limiting on Auth & AI**<br>No IP or account throttling on `/login` or `/ai/aspirant-copilot`. | **Brute-Force & Token Drain Risk:** Bots can attempt passwords or drain Gemini credits. | `app/api/v1/auth/login/route.ts`<br>`middleware.ts` | Implement Upstash Redis rate limiter (5 login attempts/min; 30 AI queries/hour). | **1.5** | Low |
| **P3-2** | **LocalStorage Study Planner State**<br>Schedule customizations are stored in browser `localStorage`. | **Multi-Device Disconnect:** Student changes schedule on laptop; phone does not reflect it. | `app/study-planner/page.tsx` | Sync schedule adjustments to PostgreSQL `UserProfile` or dedicated `StudyBlock` table. | **2.0** | Low |
| **P3-3** | **Absence of Dark Mode**<br>App is locked in high-contrast light theme (`bg-stone-50`). | **Eye Strain During Late Night Study:** Top requested feature among intensive aspirants. | `tailwind.config.js`<br>`components/**` | Implement `next-themes` dark mode class toggler across atomic components. | **3.0** | Low |

---

## 5. P4 — Long-Term Expansion & Advanced Features

| Gap ID | Issue & Failure Manifestation | Business & Technical Impact | Affected Modules | Root Cause & Recommended Fix | Effort (Days) | Risk |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **P4-1** | **Zero Non-CSE Examination Question Data**<br>13 non-CSE tracks modeled in taxonomy, but 0 question papers exist. | **Cannot Serve Allied Aspirants:** Defense (CDS, NDA) and CAPF students cannot practice. | `lib/taxonomy.ts`<br>`app/exams/page.tsx` | Ingest official past papers for CAPF (AC) Paper 1 and CDS Elementary Mathematics. | **5.0** | Med |
| **P4-2** | **State Public Service Commission Expansion**<br>No support for UPPSC, BPSC, MPPSC, or RAS state-specific papers. | **Untapped Market:** Millions of state civil service aspirants remain unserved. | `Exam` table<br>`Paper` table | Create dedicated state general knowledge modules (e.g. UP GK for UPPSC GS 5 & 6). | **8.0** | Med |
