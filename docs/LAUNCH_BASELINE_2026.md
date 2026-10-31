# PRAVAAH UPSC — Launch Baseline & Production Architecture 2026

**Document Status:** Production Baseline Approved  
**Release Target:** UPSC Civil Services Examination (CSE) Learning & Practice Beta  
**Target Launch Window:** Seven-Day Execution Plan (November 2026)  
**Repository:** `Aradhy20/pravaah-upsc`  
**Hosting Environment:** Vercel Production Deployment (`https://pravaah-upsc.vercel.app/`)  
**Database Infrastructure:** Neon Serverless PostgreSQL (`ep-floral-cloud-b4pxc8uq`)  
**ORM Tier:** Prisma ORM 5.22.0  
**Framework:** Next.js 14.2.35 (React 18/19, App Router)  
**Security & Access:** NextAuth.js with Role-Based Access Control (RBAC)  

---

## 1. Product Direction & Strategic Vision

### 1.1 UPSC-First Orientation
Pravaah UPSC is engineered exclusively for Civil Services Examination (CSE) aspirants. The platform delivers high-academic-rigor learning workflows:
1. **Concept-Driven PYQ Learning:** Authentic UPSC previous-year questions with official final answer keys and structured pedagogical solutions.
2. **Strict Examination Simulation:** Realistic 2-hour timed exam simulator with official negative marking (+2.0 / -0.666 for GS1; +2.5 / -0.833 for CSAT) and zero-knowledge anti-leak answer protection.
3. **Automated Spaced Mistake Revision:** Any missed question in Learn Mode, Daily Quiz, or Mock Tests is routed into the aspirant's personal Revision Queue for spaced repetition.
4. **Current Affairs to Syllabus Mapping:** Daily verified policy updates sourced from PIB, RBI Gazette, and PRS India linked to historical UPSC questions.
5. **Mains Answer Writing:** Structured workspace covering GS1, GS2, GS3, GS4, and Essay with word-limit counters and UPSC evaluation rubrics.

### 1.2 Non-Negotiable Operational Constraints
* **No Database Migration Away from Neon:** The platform operates exclusively on Neon Serverless PostgreSQL.
* **No Project Rebuilding / Re-architecture:** The existing Next.js 14 App Router structure is preserved and enhanced incrementally.
* **No Introduction of Google Cloud Infrastructure:** All operations leverage native Next.js, Vercel, and Neon serverless architecture.
* **Strict User Data Preservation:** All existing student profiles, notes, bookmarks, mock sessions, and subscriptions remain intact.

---

## 2. Infrastructure & Database Topology

### 2.1 Neon Serverless PostgreSQL Configuration
```
                                 [ Client Browser / Mobile ]
                                              │
                                              ▼
                         [ Vercel Edge & Serverless Functions ]
                                 (Next.js App Router 14)
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │                                                 │
          Runtime Query Traffic                               Schema Migrations
                     │                                                 │
                     ▼                                                 ▼
      [ Neon PgBouncer Pooler (Port 5432) ]              [ Direct Compute Endpoint ]
        `DATABASE_URL` (Pooled Connection)                `DATABASE_URL_UNPOOLED`
                     │                                                 │
                     └────────────────────────┬────────────────────────┘
                                              │
                                              ▼
                                 [ Neon PostgreSQL Database ]
                                        (AWS us-east-2)
```

- **Neon Organization ID:** `org-restless-glitter-45839730`
- **Neon Project ID:** `solitary-rice-12618853`
- **Active Branch:** `production` (`br-weathered-hall-b4830my7`)
- **Connection Pooling (`DATABASE_URL`):** `ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require` (PgBouncer multiplexing prevents connection exhaustion during high-concurrency student spikes).
- **Direct Unpooled URL (`DATABASE_URL_UNPOOLED`):** `ep-floral-cloud-b4pxc8uq.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require` (Used exclusively by Prisma for schema push and migration locks).
- **Prisma Client Singleton:** Encapsulated in `lib/prisma.ts` with multi-environment fallback verification (`.env.local`, `.env.production`, `.env`).

---

## 3. Verified Production Data Inventory

Audited and reconciled directly against the live Neon PostgreSQL database:

| Category | Model / Asset | Verified Live Count | Integrity Status |
| :--- | :--- | :---: | :--- |
| **Questions** | Total Question Bank Records | **1,098** | Complete relational integrity |
| | Published Prelims PYQs | **1,079** | 100% official Series A with keys |
| | Question Options (A, B, C, D) | **4,392** | Exactly 4 options per question |
| | Pedagogical Explanations | **1,098** | 100% complete with elimination hints |
| | Answer Key Versions | **10** | Audited against official final keys |
| **Mains Writing** | Mains Question Bank | **11** | GS1 (2), GS2 (2), GS3 (2), GS4 (2), ESSAY (3) |
| **Examinations** | Mock Test Definitions | **13** | Standard GS1, CSAT & diagnostic papers |
| | Test Questions Mapped | **1,179** | Linked questions across mock catalogue |
| | User Test Sessions | **77** | Real aspirant exam attempts preserved |
| | User Responses | **3,522** | Preserved student option selections |
| **Editorial** | Current Affairs Stories | **6** | Verified government feeds with syllabus tags |
| | Daily Quizzes Published | **2** | 5-question high-yield tests |
| | Daily Quiz Questions | **10** | Linked with negative marking |
| | UPSC Examination Profiles | **8** | CSE, CDS, NDA, CAPF, ESE, CMS, IFS, EPFO |
| **Users & State**| Registered Users | **121** | Authenticated accounts preserved |
| | User Profiles | **25** | Detailed study profiles |
| | Active Subscriptions | **24** | Tiered entitlement records |
| | Student Bookmarks | **41** | Isolated student bookmarks |
| | Aspirant Study Notes | **41** | Isolated private notes |
| | Spaced Revision Schedules | **3** | Active spaced repetition items |
| | Study Activities Logged | **94** | Telemetry and progress items |
| **Ingestion** | Source Registry Records | **14** | Official government source provenance |
| | Content Import Jobs | **36** | Complete audit trails |

---

## 4. End-to-End Route & Service Health Matrix

All 72 application routes compiled cleanly with 0 type errors. Runtime probes confirm operational health:

| Route Path | Type | Primary Backend Service | Status on Neon |
| :--- | :---: | :--- | :---: |
| `/` | Static | Direct SSR / Content Aggregates | **200 OK** |
| `/pyqs` | Static | `/api/v1/questions` (Filter & Search) | **200 OK** |
| `/pyqs/[year]` | Dynamic | Static Year Route with dynamic fallback | **200 OK** |
| `/pyqs/[year]/[paper]` | Dynamic | Paper Specific Catalog | **200 OK** |
| `/mock-tests` | Static | Resilient Test Simulator Catalogue | **200 OK** |
| `/mock-tests/[testId]` | Dynamic | `/api/v1/tests/session/start` (Anti-Leak) | **200 OK** |
| `/current-affairs` | Static | `/api/v1/current-affairs` (PIB/RBI Feeds) | **200 OK** |
| `/current-affairs/[slug]` | Dynamic | Full story with linked PYQs | **200 OK** |
| `/daily-quiz` | Static | `/api/v1/quiz/daily` & `/submit` | **200 OK** |
| `/mains` | Static | `/api/v1/mains` (GS1-4 & Essay) | **200 OK** |
| `/exams` | Static | `/api/v1/exams` (Multi-Exam Directory) | **200 OK** |
| `/exams/[code]` | Dynamic | Single Exam Eligibility & Profile | **200 OK** |
| `/study-planner` | Static | `/api/v1/study-planner/custom` | **200 OK** |
| `/dashboard` | Static | `/api/v1/analytics/dashboard` | **200 OK** |
| `/revision` | Static | `/api/v1/user/revision` (Spaced Repetition) | **200 OK** |
| `/bookmarks` | Static | `/api/v1/user/bookmarks` | **200 OK** |
| `/notes` | Static | `/api/v1/user/notes` | **200 OK** |
| `/pricing` | Static | `/api/v1/subscriptions/plans` | **200 OK** |
| `/login` | Static | NextAuth Credentials / Session | **200 OK** |
| `/register` | Static | `/api/v1/auth/register` | **200 OK** |
| `/admin/ingestion` | Static | `/api/v1/admin/ingestion` (RBAC Protected) | **200 OK** |

---

## 5. Security & Academic Integrity Safeguards

1. **Anti-Leak Defense:** When starting a mock test session via `/api/v1/tests/session/start`, Prisma `select` projections strictly exclude `isCorrect`, `correctOption`, and `explanation`. Answers cannot be inspected via client DevTools before submission.
2. **Tenant Scoping:** All student notes, bookmarks, exam responses, and revision items unconditionally enforce `where: { userId: session.user.id }`.
3. **Double-Submission Prevention:** Exam and Daily Quiz submission endpoints lock in-flight sessions to prevent duplicate score recording.
4. **State Machine Integrity:** Only administrators can advance content from `DRAFT` or `NEEDS_REVIEW` to `PUBLISHED`. Direct publication from unverified sources is blocked by schema and API guardrails.
5. **In-Flight Session Recovery:** `ExamPlayer` synchronizes active selections and elapsed time into `localStorage`, safeguarding against accidental tab closure or network dips.

---

## 6. Launch Success Criteria for Beta
1. **Question Fidelity:** Exactly 1,079 verified Prelims PYQs (2019–2024 Series A) available with 0 broken images or corrupted formulas.
2. **Answer Key Accuracy:** 100% agreement with official UPSC Final Keys.
3. **Test Simulation:** 100% reliable 2-hour exam sessions with exact negative marking formula.
4. **Zero Uncaught Exceptions:** 0 unhandled 500 errors across all routes; defensive fallback cards for edge cases.
5. **Automated Test Coverage:** 100% pass rate across the full 46-test regression suite.
