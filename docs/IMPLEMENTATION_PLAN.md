# Phased Implementation Plan & Delivery Roadmap
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Methodology:** Agile Iterative Delivery with Rigorous Verification  

---

## 1. Milestone Overview

| Milestone | Scope & Deliverable | Priority | Status |
|---|---|---|---|
| **M1: Foundation & Docs** | Project initialization, Next.js + TS + Tailwind setup, documentation baseline | P0 | COMPLETED |
| **M2: Database & Data Model** | Prisma schema, migrations, seed fixtures, verified questions dataset | P0 | COMPLETED |
| **M3: Public Catalog & Explorer** | Homepage, Prelims PYQ Explorer (`/pyqs`), multi-facet filters, search | P0 | COMPLETED |
| **M4: Question Player & Solving** | Learn Mode (immediate feedback, explanations), Bookmarks, Notes | P0 | COMPLETED |
| **M5: Exam Mode & Scoring** | Timed Exam player, question palette, server-side grading, scorecard | P0 | COMPLETED |
| **M6: User Analytics & Revision** | Aspirant dashboard, accuracy curves, mistake revision queue | P0 | COMPLETED |
| **M7: Admin & Ingestion Pipeline** | Ingestion pipeline, review queue, publication lifecycle, audit logs | P0 | COMPLETED |
| **M8: QA & Production Polish** | Automated test suite, accessibility check, responsive checks, build audit | P0 | COMPLETED |
| **M9: Pricing & Subscriptions** | Pricing page (`/pricing`), billing cycles, entitlement engine, checkout sandbox, webhook HMAC security, admin plans and subscriber ledger | P0 | COMPLETED |

---

## 2. Detailed Milestone Breakdown

### Milestone 1: Technical Foundation & Project Initialization
- **Tasks:**
  - Initialize Next.js 14/15 App Router project with TypeScript and Tailwind CSS.
  - Establish directory architecture: `app/`, `components/`, `lib/`, `types/`, `docs/`, `prisma/`.
  - Configure ESLint, Prettier, PostCSS, and TypeScript configuration.
- **Affected Files:** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`.
- **Acceptance Criteria:** `npm run build` succeeds cleanly with zero lint or compilation errors.

### Milestone 2: Relational Data Model & Prisma Integration
- **Tasks:**
  - Create complete Prisma schema reflecting `User`, `Paper`, `Subject`, `Topic`, `Question`, `QuestionOption`, `Explanation`, `TestSession`, `UserAttempt`, `Bookmark`, `UserNote`, `ReviewSchedule`, `AuditLog`.
  - Configure SQLite provider for reliable zero-setup local execution with PostgreSQL compatibility.
  - Implement seed script loading real, verified UPSC General Studies Paper I and CSAT questions with full explanations.
- **Affected Files:** `prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts`.
- **Acceptance Criteria:** `npx prisma db push` / `npx prisma db seed` populates database with verified questions and answer keys.

### Milestone 3: Public Catalog, Navigation & PYQ Explorer
- **Tasks:**
  - Implement scholarly academic Homepage (`/`) with Hero, Smart/Exact search, paper selector pills, and feature highlights.
  - Build Prelims PYQ Explorer (`/pyqs`) with:
    - GS1 vs. GS2 (CSAT) toggle.
    - Year chips with live question counts (e.g., `2024 (100)`).
    - Subject and topic dropdown filters.
    - Difficulty and status filters.
    - Fast full-text search.
- **Affected Files:** `app/page.tsx`, `app/pyqs/page.tsx`, `components/Header.tsx`, `components/FilterBar.tsx`, `components/QuestionCard.tsx`.
- **Acceptance Criteria:** Aspirant can filter by Paper, Year, and Subject; question cards update instantly; URL search params reflect filters.

### Milestone 4: Question Player, Learn Mode & Notes
- **Tasks:**
  - Implement interactive Learn Mode solving on question cards:
    - User clicks option $\rightarrow$ Option turns green (correct) or red (incorrect).
    - Detailed concept explanation accordion unfolds.
    - Why each wrong option is incorrect is highlighted.
    - Bookmark toggle button with state persistence.
    - Inline student notes editor.
- **Affected Files:** `components/QuestionCard.tsx`, `components/ExplanationView.tsx`, `components/NoteModal.tsx`, `app/api/v1/attempts/route.ts`.
- **Acceptance Criteria:** Selecting an option immediately shows pedagogical feedback without page reload; attempt is recorded in database/storage.

### Milestone 5: Timed Examination Mode & Scoring Engine
- **Tasks:**
  - Implement Exam Mode interface (`/mock-tests/[testId]`):
    - Full-screen countdown timer.
    - Question navigation grid (Answered, Unanswered, Marked for Review).
    - Submission modal with summary of answered vs. skipped questions.
  - Implement server-side grading API (`POST /api/v1/tests/session/submit`):
    - UPSC GS1 scoring ($+2.0 / -0.666$) and CSAT scoring ($+2.5 / -0.833$).
    - Scorecard generation with breakdown by subject.
- **Affected Files:** `app/mock-tests/page.tsx`, `app/mock-tests/[testId]/page.tsx`, `components/ExamPlayer.tsx`, `app/api/v1/tests/session/submit/route.ts`.
- **Acceptance Criteria:** Timed test executes smoothly; answers are verified server-side; scorecard calculates accurate net marks.

### Milestone 6: User Learning Analytics & Revision Queue
- **Tasks:**
  - Build Dashboard (`/dashboard`) showcasing total attempts, net accuracy, study time, and accuracy per subject.
  - Build Revision Bank (`/revision`) containing questions answered incorrectly during practice.
  - Build Bookmarks (`/bookmarks`) and Notes (`/notes`) pages.
- **Affected Files:** `app/dashboard/page.tsx`, `app/revision/page.tsx`, `app/bookmarks/page.tsx`, `app/notes/page.tsx`.
- **Acceptance Criteria:** Any question answered wrong in Learn or Exam mode appears in the Revision Queue with a re-attempt option.

### Milestone 7: Content Ingestion, Verification & Admin
- **Tasks:**
  - Build Admin Portal (`/admin`) with Question Bank manager (`/admin/questions`).
  - Build Ingestion Pipeline (`/admin/imports`) allowing JSON/CSV batch uploads with validation and error reporting.
  - Build Verification Workflow (`/admin/review`) enforcing that questions cannot be published until status is `VERIFIED`.
  - Implement Audit Logging for question modifications.
- **Affected Files:** `app/admin/page.tsx`, `app/admin/questions/page.tsx`, `app/admin/imports/page.tsx`, `app/admin/review/page.tsx`.
- **Acceptance Criteria:** Admin can upload, edit, verify, and publish questions; unverified questions remain hidden from public catalog.

### Milestone 8: QA, Performance, Accessibility & Verification
- **Tasks:**
  - Unit and integration tests for scoring engine, filter logic, and authorization.
  - End-to-end browser walkthroughs for solving, testing, and bookmarking.
  - Mobile responsiveness and accessibility audit.
  - Production build verification (`npm run build`).
- **Acceptance Criteria:** All automated tests pass; production build completes with 0 errors.

### Milestone 9: Pricing, Subscriptions & Feature Entitlement Enforcement
- **Tasks:**
  - Extend database schema with `Plan`, `PlanPrice`, `PlanFeature`, `FeatureEntitlement`, `Subscription`, `SubscriptionEvent`, `PaymentRecord`, `RefundRecord`.
  - Seed 4 tier models (Free, Beginner, Achiever, Scholar) across Monthly, Quarterly, and Annual billing intervals.
  - Implement `lib/entitlements.ts` engine enforcing server-authoritative tier checks and resource quotas.
  - Protect `POST /api/v1/tests/session/start` (requires Tier 2+), bookmark creation, and note limits.
  - Implement Public Pricing Page (`/pricing`) with interactive interval toggle, tier cards, comparison matrix, and FAQ accordion.
  - Build Checkout & Webhook Pipeline (`/api/v1/billing/checkout`, `/api/v1/billing/webhook`) with HMAC signature verification and idempotency duplicate protection.
  - Build Admin Plan Console (`/admin/plans`) and Subscriber Ledger (`/admin/subscriptions`).
- **Affected Files:** `prisma/schema.prisma`, `scripts/seed_billing.mjs`, `lib/entitlements.ts`, `app/pricing/page.tsx`, `app/admin/plans/page.tsx`, `app/admin/subscriptions/page.tsx`, `app/api/v1/billing/*`, `tests/pricing_subscriptions.test.mjs`.
- **Acceptance Criteria:** 100% pass on 19 automated tests; zero client-side bypass; clean production build.
