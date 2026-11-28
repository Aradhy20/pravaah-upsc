# PRAVAAH UPSC — RECOMMENDED MASTER DEVELOPMENT ROADMAP

**Audit Date:** November 28, 2026  
**Author:** Chief Technology Officer & Senior Full-Stack Architect  
**Purpose:** Post-Audit Sequenced Engineering Execution Plan (Releases 1 through 5)  
**Execution Rule:** Strictly Discovery Phase Output — Zero Implementation Permitted Until Explicit User Approval  

---

## 1. Master Release Strategy Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           PRAVAAH UPSC 5-STAGE RELEASE BLUEPRINT                        │
├───────────────────┬───────────────────────────────────┬─────────────┬───────────────────┤
│ Release           │ Strategic Focus                   │ Duration    │ Commercial Status │
├───────────────────┼───────────────────────────────────┼─────────────┼───────────────────┤
│ **Release 1.0**   │ Production Stabilization (P0)     │ 2.0 Days    │ Private Alpha     │
│ **Release 2.0**   │ Question Bank Expansion (2,173 Qs)│ 2.5 Days    │ Free Public Beta  │
│ **Release 3.0**   │ Live Automated Daily Current News │ 3.5 Days    │ High Engagement   │
│ **Release 4.0**   │ NCERT Bridge & Bilingual Parity   │ 5.0 Days    │ School / UP Board │
│ **Release 5.0**   │ Commercial Launch & Multi-Exam    │ 6.0 Days    │ Full Monetization │
└───────────────────┴───────────────────────────────────┴─────────────┴───────────────────┘
```

---

## 2. Release 1.0 — Production Stabilization & P0 Hotfix Suite

*Target: Eliminate all live production crashes (HTTP 500) and restore functional checkout.*  
*Total Effort: 2.0 Developer-Days*

### Task 1.1: Deploy Remote Neon Database Migrations
- **Task ID:** `P0-MIGRATE-NEON`
- **Issue:** Remote serverless database lacks `InterviewQuestion`, `MapFeature`, and `UserUsageLedger` tables.
- **Business Impact:** Restores 4 crashing public routes (`/map-lab`, `/interview`, `/search`, `/mains/evaluate`).
- **Technical Impact:** Eliminates PostgreSQL `42P01` runtime exceptions.
- **Files Involved:** `prisma/schema.prisma`, `scripts/deploy_db_setup.mjs`.
- **Recommended Fix:** Run `npx prisma migrate deploy` targeting remote Neon `DATABASE_URL` or execute table synchronizer in Vercel build script.
- **Effort:** 0.5 Days | **Risk:** Low | **Tests:** Live HTTP 200 checks on `/api/v1/map-lab` and `/api/v1/interview`.

### Task 1.2: Resolve Cashfree Production Environment & Credential Pairing
- **Task ID:** `P0-CASHFREE-CONFIG`
- **Issue:** Live order creation returns `authentication Failed` (HTTP 500).
- **Business Impact:** Enables students to purchase subscriptions.
- **Technical Impact:** Routes requests to `https://api.cashfree.com/pg` with production keys.
- **Files Involved:** `lib/payments/payment-config.ts`, Vercel Environment Variables.
- **Recommended Fix:** Set `CASHFREE_ENVIRONMENT=PROD`, verify `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET` in Vercel.
- **Effort:** 0.5 Days | **Risk:** Low | **Tests:** `POST /api/v1/payments/create-order` returns real `payment_session_id`.

### Task 1.3: Re-Seed Canonical Pricing Catalog in Production Database
- **Task ID:** `P0-PRICE-SYNC`
- **Issue:** Live `/api/v1/plans` returns legacy ₹399/₹799 prices instead of canonical ₹149/₹299/₹499.
- **Business Impact:** Eliminates pricing confusion and legal billing risks.
- **Technical Impact:** Synchronizes `SubscriptionPlan` and `PlanPrice` rows.
- **Files Involved:** `scripts/seed_monetization_plans.mjs`.
- **Effort:** 0.5 Days | **Risk:** Low | **Tests:** `GET /api/v1/plans` returns ₹149 for PLUS, ₹299 for PRO.

### Task 1.4: Harden Session Token Test Bypass Guard
- **Task ID:** `P0-AUTH-HARDEN`
- **Issue:** `lib/auth.ts` allows any string matching `^cm[a-z0-9]+$` without HMAC signature.
- **Business Impact:** Eliminates critical account impersonation vulnerability.
- **Files Involved:** `lib/auth.ts` (Lines 54–57).
- **Recommended Fix:** Wrap raw ID fallback in `if (process.env.NODE_ENV === "test")`.
- **Effort:** 0.5 Days | **Risk:** Low | **Tests:** `tests/registration_production_repair.test.mjs`.

---

## 3. Release 2.0 — Question Bank Ingestion & Content Expansion

*Target: Promote 2,052 verified staging questions to reach a 2,173-question active bank.*  
*Total Effort: 2.5 Developer-Days*

### Task 2.1: Atomic Promotion of 2,052 Verified Staging Records
- **Task ID:** `P1-STAGING-PROMOTION`
- **Issue:** 2,052 verified questions sit in `QuestionStagingRecord` while students only have access to 121.
- **Business Impact:** Expands platform practice content by **18x**, solving content starvation.
- **Technical Impact:** Upserts questions, options, answer keys, and syllabus mappings in transactional batches of 100.
- **Files Involved:** `scripts/promote_verified_staging_questions.ts`, `prisma/schema.prisma`.
- **Recommended Fix:** Execute live promotion with transaction rollback guard and audit logging in `IngestionJobAudit`.
- **Effort:** 1.5 Days | **Risk:** Med | **Tests:** Verify `prisma.question.count()` reaches 2,173.

### Task 2.2: Batch Syllabus Auto-Alignment for Promoted Questions
- **Task ID:** `P1-SYLLABUS-RECONCILE`
- **Issue:** Promoted questions require canonical linking to 53 `SyllabusNode` micro-themes.
- **Files Involved:** `scripts/reconcile_canonical_syllabus_mappings.ts`.
- **Effort:** 1.0 Days | **Risk:** Low | **Tests:** Verify 0 unmapped questions in `UNMAPPED_QUESTIONS.csv`.

---

## 4. Release 3.0 — Live Automated Current Affairs & Daily Quiz Loop

*Target: Transform static news into an automated daily learning engine.*  
*Total Effort: 3.5 Developer-Days*

### Task 3.1: Automated PIB & Government Press Release Harvester
- **Task ID:** `P1-CURRENT-AFFAIRS-CRON`
- **Issue:** Current affairs is static (56 seeded stories with null dates).
- **Business Impact:** Creates daily student habit loop (Daily Active Users).
- **Technical Impact:** Runs Vercel Cron at 06:00 IST daily; parses PIB RSS feeds; tags GS1/GS2/GS3 syllabus nodes.
- **Files Involved:** `app/api/v1/cron/daily-ingest/route.ts`, `vercel.json`, `lib/sources/pib-adapter.ts`.
- **Effort:** 2.0 Days | **Risk:** Med | **Tests:** Verify new story appears daily in `CurrentAffairsStory`.

### Task 3.2: Daily Quiz Auto-Generator
- **Task ID:** `P1-DAILY-QUIZ-GEN`
- **Issue:** Daily quiz repeats same 5 questions.
- **Business Impact:** Keeps aspirants testing daily current knowledge.
- **Files Involved:** `app/api/v1/quiz/daily/route.ts`.
- **Effort:** 1.5 Days | **Risk:** Low | **Tests:** Verify daily 5-question rotation without repeats.

---

## 5. Release 4.0 — CBSE / UP Board Foundation & Bilingual Parity

*Target: Build the foundational bridge for Class 9–12 school and Hindi-medium students.*  
*Total Effort: 5.0 Developer-Days*

### Task 4.1: NCERT Chapter-to-Question Interactive Mapping
- **Task ID:** `P2-NCERT-LINKAGE`
- **Issue:** Only 2 questions are linked to 44 NCERT chapters in the database.
- **Business Impact:** Unlocks foundational school and beginner college preparation.
- **Files Involved:** `NCERTChapterQuestionLink`, `app/ncert/page.tsx`.
- **Effort:** 3.0 Days | **Risk:** Low | **Tests:** Verify at least 5–10 interactive questions per NCERT chapter.

### Task 4.2: Official Hindi Question Text Ingestion (80 Questions)
- **Task ID:** `P2-HINDI-POPULATION`
- **Issue:** 80 of 121 published questions lack Hindi translations (`TRANSLATION_MISSING`).
- **Business Impact:** Provides full mock test parity for UP Board / Hindi-medium aspirants.
- **Files Involved:** `Question` (`questionTextHi`), `QuestionOption` (`optionTextHi`).
- **Effort:** 2.0 Days | **Risk:** Low | **Tests:** Verify 100% bilingual toggle parity.

---

## 6. Release 5.0 — Commercial Launch & Multi-Exam Expansion

*Target: Open paid subscriptions to the public and ingest defense/paramilitary exams.*  
*Total Effort: 6.0 Developer-Days*

### Task 5.1: Live Cashfree Enablement & End-to-End Payment Smoke Test
- **Task ID:** `P3-ENABLE-PAYMENTS`
- **Action:** Set `ENABLE_PAYMENTS=true` in production environment after verifying Releases 1–4.
- **Effort:** 1.0 Days | **Risk:** Med | **Tests:** Execute real ₹149 live transaction and verify automatic subscription activation.

### Task 5.2: Ingest CAPF (AC) and CDS Question Banks
- **Task ID:** `P4-MULTI-EXAM-INGESTION`
- **Action:** Ingest 5 past papers for CAPF Assistant Commandant Paper 1 and CDS Elementary Mathematics.
- **Effort:** 5.0 Days | **Risk:** Med | **Tests:** Verify `/exams/CAPF` and `/exams/CDS` render real practice tests.
