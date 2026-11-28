# PRAVAAH UPSC — COMPLETE FEATURE & MODULE INVENTORY

**Audit Date:** November 28, 2026  
**Status:** Comprehensive Codebase & Filesystem Discovery  
**Audit Standard:** Line-Level Code Inspection, Database Cross-Referencing & Production Verification  

---

## 1. Directory Structure & Module Topology

```
pravaah-upsc/
├── app/                        # Next.js 14 App Router (59 Page Routes, 72 API Routes)
│   ├── (public)/               # Static marketing & informational pages
│   ├── admin/                  # Administrative management & ingestion dashboards (15 sub-routes)
│   ├── api/v1/                 # Backend RESTful JSON API layer
│   │   ├── admin/              # Administrative & database maintenance endpoints
│   │   ├── ai/                 # Multi-provider LLM & Copilot endpoints
│   │   ├── auth/               # HMAC session & Google OAuth endpoints
│   │   ├── corpus/             # Historical exam document discovery
│   │   ├── payments/           # Cashfree order creation & verification
│   │   ├── pyqs/               # Question retrieval & filter engine
│   │   └── user/               # Student workspace (bookmarks, notes, revision)
│   ├── dashboard/              # Student command center & billing settings
│   ├── pyqs/                   # Longitudinal question bank exploration
│   └── mock-tests/             # Timed examination player & scorecard
├── components/                 # Reusable UI component layer (17 root & ui/ components)
│   └── ui/                     # Design system atoms (Buttons, Badges, Cards, Layout, Modal)
├── docs/                       # Project architecture & audit documentation
│   └── saas-discovery/         # Master discovery assessment suite (18 reports)
├── lib/                        # Core backend domain services & business logic
│   ├── ai/                     # AI Orchestrator & Gemini API bridge
│   ├── content-validation/     # Answer key & question schema validation guards
│   ├── data-acquisition/       # PDF parsing, classification & source registry
│   ├── i18n/                   # Bilingual dictionary & context provider (En / Hi)
│   ├── payments/               # Cashfree provider, pricing catalogue & subscription activator
│   └── services/               # RAG engine, answer verification & duplicate detection
├── prisma/                     # Database architecture (schema.prisma, 4 migrations)
├── scripts/                    # 48 Ingestion, audit, seed & deployment scripts
│   ├── corpus/                 # Document staging & corpus processing
│   └── pyq/                    # Staging, normalization & import scripts
└── tests/                      # Node.js automated test suites (70 test cases across 4 files)
```

---

## 2. Complete Module & Feature Classification Register

Every discovered module in Pravaah UPSC is categorized according to its actual implementation reality:

- **[A] ACTIVE & VERIFIED:** Production-functional, connected to database, tested and working.
- **[B] FUNCTIONAL WITH LIMITATIONS:** Working, but constrained by data sufficiency or minor gaps.
- **[C] PARTIALLY IMPLEMENTED:** Frontend or backend scaffolding exists, but integration is incomplete.
- **[D] FRONTEND ONLY:** Polished UI exists, but backed by hardcoded state or non-functional buttons.
- **[E] BACKEND ONLY:** Functional API or script exists, but lacks student-facing UI.
- **[F] MOCK / HEURISTIC:** Functional appearance, but relies on static heuristics or mock responses.
- **[G] BROKEN / CRASHING:** Fails on live production with runtime exceptions or HTTP 500 errors.
- **[H] UNUSED / DEPRECATED:** Dead code, legacy files from earlier iterations, or obsolete utilities.

---

## 3. Comprehensive Feature Inventory Matrix

| Feature / Module | Physical Location | Classification | Operational Reality & Evidence |
| :--- | :--- | :---: | :--- |
| **User Registration** | `app/register/page.tsx`<br>`app/api/v1/auth/register/route.ts` | **[A] ACTIVE** | Generates user + profile + free subscription atomically in PostgreSQL. Returns HTTP 201 on success, 409 on duplicate. |
| **User Login** | `app/login/page.tsx`<br>`app/api/v1/auth/login/route.ts` | **[A] ACTIVE** | Verifies PBKDF2/scrypt hashed password; issues HMAC-SHA256 signed `pravaah_user_id` cookie. Verified on live prod. |
| **Google OAuth** | `app/api/v1/auth/google/route.ts`<br>`app/api/v1/auth/google/callback/route.ts` | **[B] LIMITATION** | Implemented via `lib/google-auth.ts`. Requires valid `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in production env. |
| **Prelims Practice Engine** | `app/pyqs/page.tsx`<br>`app/api/v1/pyqs/route.ts` | **[B] LIMITATION** | Filtering by year, subject, paper works. Data constrained to 121 published questions. |
| **Timed Test Player** | `app/mock-tests/[testId]/page.tsx`<br>`components/ExamPlayer.tsx` | **[A] ACTIVE** | Countdown timer, question palette, marked-for-review, submit modal. Full score calculation (+2/-0.666). |
| **Test Session API** | `app/api/v1/tests/session/start/route.ts`<br>`app/api/v1/tests/session/submit/route.ts` | **[A] ACTIVE** | Tested live: returns session ID, questions, accepts answer map, computes net score, updates `TestSession`. |
| **CSAT Diagnostic Coach** | `app/csat-coach/page.tsx`<br>`app/api/v1/csat/coach/route.ts` | **[B] LIMITATION** | Renders CSAT diagnostic drill (+2.5/-0.833 scoring). Limited to 47 CSAT questions in database. |
| **Mains Subjective Portal** | `app/mains/page.tsx`<br>`app/api/v1/mains/route.ts` | **[A] ACTIVE** | Renders 32 descriptive questions across GS1-GS4 & Essay with word limits and structural framework guidance. |
| **Mains Answer Evaluation** | `app/api/v1/mains/evaluate/route.ts` | **[G] BROKEN (PROD)** | Crashes on live production with **HTTP 500** because `MainsDraft` or `UserUsageLedger` table is missing on Neon. |
| **Interview & DAF Prep** | `app/interview/page.tsx`<br>`app/api/v1/interview/route.ts` | **[G] BROKEN (PROD)** | Crashes on live production with **HTTP 500** (`relation "InterviewQuestion" does not exist` on Neon). |
| **Interactive Map Lab** | `app/map-lab/page.tsx`<br>`app/api/v1/map-lab/route.ts` | **[G] BROKEN (PROD)** | Crashes on live production with **HTTP 500** (`relation "MapFeature" does not exist` on Neon). |
| **Universal Aspirant Search** | `components/Header.tsx`<br>`app/api/v1/search/route.ts` | **[G] BROKEN (PROD)** | Crashes on live production with **HTTP 500** because search queries `MapFeature` and `InterviewQuestion`. |
| **Video Strategy Academy** | `app/video-academy/page.tsx`<br>`app/api/v1/videos/route.ts` | **[B] LIMITATION** | Renders YouTube embedded masterclasses. Production Neon has only 5 videos (local has 25). |
| **Topper Copy Archive** | `app/topper-copies/page.tsx`<br>`app/api/v1/topper-copies/route.ts` | **[B] LIMITATION** | Renders annotated answer scripts from AIR 1, 2, 3. Production Neon has only 5 copies (local has 13). |
| **NCERT Foundational Hub** | `app/ncert/page.tsx`<br>`app/api/v1/ncert/route.ts` | **[C] PARTIAL** | Displays 9 books and 44 chapters, but only 2 questions are linked. Mostly acts as a PDF directory. |
| **Current Affairs Portal** | `app/current-affairs/page.tsx`<br>`app/api/v1/current-affairs/route.ts` | **[F] STATIC** | Displays 56 static articles seeded into PostgreSQL. No automated daily crawler running in production. |
| **Daily Quiz** | `app/daily-quiz/page.tsx`<br>`app/api/v1/quiz/daily/route.ts` | **[B] LIMITATION** | Pulls 5 daily questions from published bank. Repeats same questions due to content limitation. |
| **Study Planner** | `app/study-planner/page.tsx`<br>`app/api/v1/study-planner/today/route.ts` | **[C] PARTIAL** | Renders daily study schedule, but customized schedule generation is client-state heavy. |
| **Mission Control** | `app/mission-control/page.tsx`<br>`app/api/v1/mission-control/route.ts` | **[B] LIMITATION** | Dashboard displaying syllabus progress, revision streaks, and readiness index based on `UserProfile`. |
| **Student Bookmarks** | `app/bookmarks/page.tsx`<br>`app/api/v1/user/bookmarks/route.ts` | **[A] ACTIVE** | Student can bookmark questions; persists to PostgreSQL `Bookmark` table. |
| **Student Study Notes** | `app/notes/page.tsx`<br>`app/api/v1/user/notes/route.ts` | **[A] ACTIVE** | Student can attach markdown notes to questions; persists to `UserNote` table. |
| **Mistake Notebook** | `app/revision/page.tsx`<br>`app/api/v1/user/mistakes/route.ts` | **[C] PARTIAL** | Page exists, but `UserMistakeClassification` table has 0 rows. Relies on `TestSession` response parsing. |
| **Pricing & Plans Page** | `app/pricing/page.tsx`<br>`app/api/v1/plans/route.ts` | **[B] LIMITATION** | Renders pricing cards, but live API returns legacy database plan prices instead of canonical specification. |
| **Cashfree Order Creation** | `app/api/v1/payments/create-order/route.ts` | **[G] BROKEN (PROD)** | Live checkout returns **HTTP 500** (`ORDER_CREATION_FAILED - authentication Failed`). |
| **Cashfree Webhook Handler** | `app/api/webhooks/cashfree/route.ts` | **[A] VERIFIED** | HMAC-SHA256 signature verification, replay attack drift guard, and idempotency logic pass all 10 unit tests. |
| **Billing Management** | `app/dashboard/billing/page.tsx`<br>`app/api/v1/user/billing/route.ts` | **[B] LIMITATION** | Displays current plan and transaction ledger. Works with existing 145 payment records. |
| **Bilingual Language Switcher** | `components/LanguageSwitcher.tsx`<br>`lib/i18n/context.tsx` | **[A] ACTIVE** | Toggles English / Hindi UI labels. Questions render in English or Hindi if translation exists. |
| **Admin Ingestion Dashboard** | `app/admin/ingestion/page.tsx`<br>`app/api/v1/admin/ingestion/route.ts` | **[B] LIMITATION** | Displays source health, job status, and triggers CLI scripts. Intended strictly for administrative use. |
| **Admin Data Integrity** | `app/admin/data-integrity/page.tsx`<br>`app/api/v1/admin/data-integrity/route.ts` | **[A] ACTIVE** | Audits database orphans, unmapped questions, missing explanations, and schema drift. |
| **Admin Batch Importer** | `app/admin/imports/page.tsx`<br>`app/api/v1/admin/import/batch/route.ts` | **[A] ACTIVE** | Validates and imports JSON question batches into `QuestionStagingRecord` with transaction safety. |
| **Admin Translations** | `app/admin/translations/page.tsx`<br>`app/api/v1/admin/translations/route.ts` | **[C] PARTIAL** | Lists questions with missing translations; lacks automated translation reconciliation editor. |
| **Admin Plan Management** | `app/admin/plans/page.tsx`<br>`app/api/v1/admin/plans/route.ts` | **[A] ACTIVE** | Allows viewing and toggling plan features and prices. |
| **Admin Subscriptions** | `app/admin/subscriptions/page.tsx`<br>`app/api/v1/admin/subscriptions/route.ts` | **[A] ACTIVE** | Displays active user subscriptions and renewal dates. |
| **Legacy UPI Gateway** | `app/api/v1/payments/submit-utr/route.ts` (deleted) | **[H] DEPRECATED** | Fully removed in previous refactoring; zero references remain. |
| **SQLite Fallback Scripts** | `prisma/dev.db`<br>`scripts/export_sqlite.py` | **[H] UNUSED** | Obsolete SQLite database from early local prototyping; PostgreSQL is the sole active datasource. |

---

## 4. Codebase Hygiene & Technical Debt Summary

- **Dead Routes / Modules:** `scripts/export_sqlite.py`, legacy SQLite references in `scripts/extract_questions.py`, unused `lib/scoring.js` (superseded by `lib/scoring.ts`).
- **Unfinished Implementations:** NCERT Chapter-Question linker (only 2 links seeded), Mistake notebook categorization (0 rows in `UserMistakeClassification`), Daily cron crawler (`app/api/v1/cron/daily-ingest/route.ts` exists but is not scheduled on Vercel Cron).
- **Environment Disconnects:** Production Neon PostgreSQL database has schema drift (missing 3 tables created in recent migrations), causing 4 public API endpoints to fail on live deployment.
