# PRAVAAH UPSC 2.0 — API Architecture & Security Audit

**Date:** November 28, 2026  
**Total Registered Routes:** 78 API endpoints  
**Architecture:** Next.js Route Handlers (`app/api/v1/**/route.ts`)  
**Auditor:** Senior Backend Architect & Security Lead  

---

## 1. Complete API Route Catalog

The application exposes 78 RESTful endpoints organized under `/api/v1/` and `/api/webhooks/`:

### A. Authentication & User Profile (`/api/v1/auth/*`, `/api/v1/user/*`)
- `POST /api/v1/auth/register` — Validates credentials, checks duplicates (409), creates User/Profile/Subscription atomically, sets JWT cookie.
- `POST /api/v1/auth/login` — Authenticates email/password, issues session token.
- `POST /api/v1/auth/logout` — Clears authentication cookie.
- `GET /api/v1/auth/me` — Returns authenticated user profile and subscription status.
- `POST /api/v1/auth/google` — Google OAuth token exchange and user provisioning.
- `GET /api/v1/auth/google/callback` — OAuth 2.0 redirect handler.
- `POST /api/v1/auth/switch-role` — Dev/admin role testing switch.
- `GET/PUT /api/v1/user/profile` — Reads/updates candidate profile parameters.
- `GET/PUT /api/v1/user/preferences` — Reads/writes student subject strengths with array safety.
- `GET /api/v1/user/bookmarks` — Candidate saved questions.
- `GET /api/v1/user/notes` — Personal margin notes.
- `GET /api/v1/user/mistakes` — Diagnostic error notebook and spaced repetition.
- `GET /api/v1/user/revision` — Spaced repetition schedule and flashcard queue.
- `GET /api/v1/user/billing` — Invoices and payment history.
- `POST /api/v1/user/subscription/cancel` — Manages subscription auto-renew cancellation.

### B. Core Academic APIs (`/api/v1/questions/*`, `/api/v1/pyqs/*`, `/api/v1/exams/*`)
- `GET /api/v1/questions` — Multi-faceted question bank filter (year, paper, subject, topic, difficulty).
- `GET /api/v1/pyqs/inventory` — Dynamic single source of truth for verified question counts.
- `GET /api/v1/pyqs` — Year-wise examination paper listings.
- `GET /api/v1/pyqs/[id]` — Single question detail view.
- `POST /api/v1/questions/report` — Crowdsourced issue flagger logging to `ContentReview`.
- `GET /api/v1/exams` — Available examination tracks and notifications.
- `GET /api/v1/exams/[code]` — Stage, syllabus, and paper details for a specific exam.
- `GET /api/v1/coverage` — 30-year syllabus coverage matrix.

### C. Prelims, Mains & Interview Engines
- `POST /api/v1/tests/session/start` — Initializes timed mock test session, returns randomized questions without answers.
- `POST /api/v1/tests/session/submit` — Server-side scoring engine with negative marking, returns diagnostic report.
- `GET/POST /api/v1/quiz/daily` — Daily quiz retriever and submission handler.
- `GET /api/v1/mains` — Mains question repository.
- `POST /api/v1/mains/draft` — Saves user answer draft with word count telemetry.
- `POST /api/v1/mains/evaluate` — AI rubric-based evaluation.
- `GET/POST /api/v1/interview` — DAF profiling and conversational follow-up questions.
- `GET /api/v1/csat/coach` — Quantitative aptitude and comprehension diagnostic logic.

### D. Payments & Subscriptions (`/api/v1/payments/*`, `/api/v1/billing/*`)
- `GET /api/v1/plans` — Canonical pricing plans (FREE, PLUS, PRO, ELITE).
- `POST /api/v1/payments/create-order` — Cashfree hosted order creation with server-side price enforcement.
- `GET /api/v1/payments/orders/[orderId]/status` — Cashfree order status check.
- `POST /api/v1/payments/orders/[orderId]/verify` — Verification of payment status.
- `POST /api/webhooks/cashfree` — Cashfree webhook with HMAC-SHA256 signature verification and replay protection.
- *DEPRECATED:* `POST /api/webhooks/upi-gateway` — Manual gateway webhook (to be removed).
- *DEPRECATED:* `POST /api/v1/payments/orders/[orderId]/submit-utr` — Manual UTR submission (to be removed).

### E. Administration & Content CMS (`/api/v1/admin/*`)
- `GET /api/v1/admin/data-integrity` — Orphan check and referential integrity audit.
- `GET/POST /api/v1/admin/plans` — Management of subscription pricing and features.
- `GET /api/v1/admin/payments` — Financial transaction ledger and reconciliation.
- `GET /api/v1/admin/subscriptions` — Active subscriber management.
- `GET /api/v1/admin/revenue` — Real MRR/ARR analytics from PostgreSQL.
- `GET/POST /api/v1/admin/staging` — Review and promotion of `QuestionStagingRecord`.
- `POST /api/v1/admin/import/batch` — RFC 4180 CSV importer.
- `POST /api/v1/admin/sync-schema` — Administrative PostgreSQL column verification.

---

## 2. API Security, Sanitation & Error Handling

1. **Authentication Token Verification:**  
   JWT tokens are verified with HMAC-SHA256. Invalid or expired tokens return `401 Unauthorized` without leaking server traces.
2. **Server-Side Price Protection:**  
   Orders created via `/api/v1/payments/create-order` ignore client-submitted prices and resolve amounts exclusively from the server-authoritative catalogue (`lib/pricing.ts`).
3. **Information Disclosure Prevention:**  
   All catch blocks in recently hardened endpoints suppress internal Prisma call stacks and return standardized error objects:
   ```json
   {
     "success": false,
     "error": {
       "code": "ERROR_CODE",
       "message": "User-friendly description."
     }
   }
   ```
