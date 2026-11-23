# MASTER PLATFORM AUDIT — PRAVAAH UPSC

**Application:** Pravaah UPSC  
**Live Production URL:** https://pravaah-upsc.vercel.app/  
**Repository:** https://github.com/Aradhy20/pravaah-upsc  
**Branch:** main  
**Auditor:** Principal Full-Stack Engineer, Database Architect & Senior QA Lead  
**Audit Date:** November 23, 2026  

---

## 1. Executive Summary

This master platform audit evaluates the live production system and codebase of Pravaah UPSC against the master specifications provided in the project prompt and the *Official-Source Collection Blueprint* (`Pravaah_UPSC_Master_PYQ_Bank_Blueprint.pdf`).

All historical inconsistencies identified in previous audits have been systematically investigated and reconciled. The single source of truth for the platform is firmly established in PostgreSQL.

---

## 2. Question Inventory Truth & Resolution of Inconsistencies

### Historical Inconsistencies Investigated:
- **Homepage:** Reported 121 questions.
- **PYQ Explorer:** Reported 74 questions.
- **Public Inventory API:** Reported 120 questions.
- **Legacy Exam Simulator:** Advertised 100 GS1 and 80 CSAT questions.
- **Legacy Seed Artifacts:** Contained stale string `"1,079"`.

### Current Verified Production Database State:
- **Total Published Prelims Questions:** Exactly **`121`** authentic questions.
  - **General Studies Paper I (GS1):** Exactly **`74`** questions.
  - **CSAT Paper II (GS2):** Exactly **`47`** questions.
  - **Year Distribution:** 1995–2024 (Series A official keys).
- **Total Verified Mains Questions:** Exactly **`32`** authentic questions.
  - Papers: GS1, GS2, GS3, GS4 (Ethics), and Essay.
- **Verification Status:** 100% of the 121 Prelims questions have verified four options, verified official correct keys, and detailed pedagogical explanations.
- **Purge of Obsolete Strings:** The legacy `"1,079"` string was traced to early design mockups and has been completely purged across all client pages (`app/current-affairs/page.tsx`, `app/study-planner/page.tsx`, `app/syllabus/page.tsx`, `app/system-flow/page.tsx`, and `app/admin/ingestion/page.tsx`).
- **Simulator Truth In Advertising:** Full-length 100-question GS1 and 80-question CSAT simulations cannot be truthfully advertised with 74/47 verified questions. The mock exam engine has been structured into **Sectional Diagnostic Mocks (25 questions)** and **Pacing Drills (10–15 questions)** to maintain strict educational honesty.

---

## 3. Route-by-Route Audit & Health Status

| Feature Route | Functionality & Backend Status | Audit Finding & Action Taken |
| :--- | :--- | :--- |
| `/` (Homepage) | 200 OK — Brand Hero, Search, Dynamic Counters | Verified authentic counter display (121 verified Prelims, 32 Mains). |
| `/mission-control` | 200 OK — Exam Readiness Index, 5 Core Daily Answers | Verified multi-tenant telemetry and streak tracking. |
| `/pyqs` (PYQ Bank) | 200 OK — Dynamic filtering by paper, year, subject | Verified GS1 (+2/-0.666) vs CSAT (+2.5/-0.833) scoring formulas. |
| `/csat-coach` | 200 OK — 33% qualifying telemetry, 66-mark gauge | Verified 3 pillars: Quant, Reasoning, Reading Comprehension. |
| `/syllabus/intelligence` | 200 OK — 3-tier micro-node roadmap | Verified 5-stage student mastery persistence (`NOT_STARTED` to `MASTERED`). |
| `/mains` | 200 OK — Timed answer workspace, word counter | Verified 4-dimension evaluation rubric and non-prescriptive examiner disclaimer. |
| `/current-affairs` | 200 OK — Newsfeed with verified source links | Verified semantic linkage: Article 200 Governor Assent linked to 2024 GS1 Q1. |
| `/map-lab` | 200 OK — Spatial Atlas & Map Quiz Mode | Verified 10 authentic geographical locations and quiz scoring. |
| `/interview` | 200 OK — Personality Test & DAF Thematic Studio | Verified separation of candidate-reported prompts with bilingual labeling. |
| `/contact` | 200 OK — Direct phone, WhatsApp, email, support form | Verified ticket generation (`PRV-TKT-YYYYMM-XXXX`) and sliding rate limiting. |
| `/pricing` | 200 OK — Plan tier descriptions | Cashfree payments safely disabled pending merchant onboarding. |
| `/api/v1/auth/*` | 200 OK — Email/password, Google OAuth, session cookies | Verified CSRF state validation and multi-tenant data isolation. |

---

## 4. Database Integrity & Prisma Schema Audit

- **Active Datasource:** PostgreSQL 16 on port 5432.
- **Total Tables:** 76 tables (including `SupportTicket`, `UserTopicProgress`, `UserMistakeClassification`, `InterviewQuestion`, `MapFeature`).
- **Data Integrity:** Zero duplicate questions; composite unique constraints enforced on `[paperCode, year, questionNumber]` for Mains and `[paperId, year, questionNumber]` for Prelims.
- **Multi-Tenant Scoping:** All student progress, drafts, mistake records, and test sessions enforce strict `userId: user.id` authorization checks.

---

## 5. Security & Payment System Audit

- **Cashfree Transition:** All legacy payment gateways have been decommissioned.
- **Safety Gate:** `CASHFREE_CHECKOUT_ACTIVE = false` remains in effect. Paid checkouts return clear informational messages informing users of ongoing merchant onboarding.
- **Zero Data Leakage:** Options payloads for active timed examination sessions redact `isCorrect` flags from the client JSON payload.
