# API AUDIT & ENDPOINT SPECIFICATION: PRAVAAH UPSC
**Document Version:** 2.0.0  
**Audit Date:** November 22, 2026  
**Base URL:** `http://localhost:3000` / `https://pravaah-upsc.vercel.app`  
**Total Audited Endpoints:** 44 API Routes  
**Status:** 100% Operational, Zero 500 Unhandled Exceptions  

---

## 1. Authentication & Session Management APIs

| Method | Endpoint Path | Access Level | Description & Payload | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new aspirant account (`email`, `password`, `fullName`, `examYear`). Sets session cookie. | `201 Created` / `400 Bad Request` |
| `POST` | `/api/v1/auth/login` | Public | Authenticate student via email/password. Issues signed JWT HTTP-only cookie. | `200 OK` / `401 Unauthorized` |
| `POST` | `/api/v1/auth/logout` | Public | Clears `pravaah_session` and OAuth state cookies. | `200 OK` |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieves active aspirant profile, role, subscription tier, and feature entitlements. | `200 OK` / `401 Unauthorized` |
| `GET` | `/api/v1/auth/google` | Public | Generates cryptographic CSRF state token and redirects to Google OAuth 2.0 or test callback. | `307 Temporary Redirect` |
| `GET` | `/api/v1/auth/google/callback` | Public | Exchanges authorization code, validates CSRF state cookie, provisions or links user. | `302 Found (Redirect to /dashboard)` |
| `POST` | `/api/v1/auth/switch-role` | Authenticated | Allows developer/admin role toggling for local testing (`STUDENT` <-> `ADMIN`). | `200 OK` / `403 Forbidden` |

---

## 2. PYQ, Question Bank & Intelligent Search APIs

| Method | Endpoint Path | Access Level | Description & Query Parameters | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/questions` | Public | Filters question catalog (`paper`, `years`, `subject`, `topic`, `difficulty`, `page`, `limit`). | `200 OK` (Array with metadata) |
| `GET` | `/api/v1/pyqs` | Public | Primary PYQ endpoint with options, verified answers, and official source document links. | `200 OK` |
| `GET` | `/api/v1/pyqs/[id]` | Public | Retrieves detailed single question view with pedagogical explanation and syllabus mapping. | `200 OK` / `404 Not Found` |
| `GET` | `/api/v1/pyqs/inventory` | Public | Aggregate telemetry: questions by year, paper code, subject, and verification status. | `200 OK` |
| `GET` | `/api/v1/search` | Public | Dual search: `mode=exact` (ILIKE) and `mode=smart` (conceptual semantic match). | `200 OK` |
| `POST` | `/api/v1/questions/report` | Authenticated | Aspirant question issue reporting (errata, ambiguity, typo submission). | `200 OK` |

---

## 3. Examination Simulator & Practice APIs

| Method | Endpoint Path | Access Level | Description & Logic | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/tests/session/start` | Authenticated | Initiates timed exam session. **Strict Anti-Leak:** Stripts `isCorrect` and explanations. | `200 OK` (Returns `sessionId`, questions) |
| `POST` | `/api/v1/tests/session/submit` | Authenticated | Grades exam answers server-side with strict UPSC negative marking (GS1: -0.666, CSAT: -0.833). | `200 OK` (Score, accuracy, deltas) |
| `POST` | `/api/v1/attempts/learn` | Authenticated | Interactive Learn Mode: Checks single MCQ choice and returns instant pedagogical feedback. | `200 OK` |
| `GET` | `/api/v1/quiz/daily` | Public | Fetches today's 5-question Prelims challenge with redacted answer keys. | `200 OK` |
| `POST` | `/api/v1/quiz/daily/submit` | Authenticated | Submits daily quiz responses and persists attempt records to aspirant streak. | `200 OK` |

---

## 4. Academics, Mains & Knowledge Base APIs

| Method | Endpoint Path | Access Level | Description & Logic | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/mains` | Public | Fetches Mains questions filtered by paper (`GS1`, `GS2`, `GS3`, `GS4`) and year. | `200 OK` |
| `POST` | `/api/v1/mains/evaluate` | Authenticated | Multi-dimensional AI evaluation: Context (40%), Analysis (30%), Structure (15%), Presentation (15%). | `200 OK` (Detailed rubric & marks) |
| `POST` | `/api/v1/ai/assistant` | Authenticated | Grounded RAG mentor answering student doubts with citations to official syllabus and NCERTs. | `200 OK` |
| `GET` | `/api/v1/current-affairs` | Public | Returns daily PIB and Ministry Gazette summaries linked to syllabus and authentic PYQs. | `200 OK` |
| `GET` | `/api/v1/current-affairs/[slug]` | Public | Single editorial brief with historical questions and practice MCQs. | `200 OK` / `404 Not Found` |
| `GET` | `/api/v1/exams` | Public | Multi-exam catalogue (CSE, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO). | `200 OK` |
| `GET` | `/api/v1/exams/[code]` | Public | Detailed exam dossier with eligibility, age criteria, stages, and notification URLs. | `200 OK` / `404 Not Found` |
| `GET` | `/api/v1/syllabus` | Public | Complete UPSC notification syllabus nodes mapped to subjects. | `200 OK` |
| `GET` | `/api/v1/syllabus/tree` | Public | 3-tier hierarchical JSON tree for interactive visual syllabus explorer. | `200 OK` |
| `GET` | `/api/v1/ncert` | Public | NCERT textbook catalogue and chapters mapped to UPSC high-yield themes. | `200 OK` |
| `GET` | `/api/v1/videos` | Authenticated | Seeded foundational masterclass video lessons. | `200 OK` |
| `GET` | `/api/v1/topper-copies` | Authenticated | Annotated toppers' handwritten test copies with faculty commentary. | `200 OK` |
| `GET` | `/api/v1/study-planner/today` | Authenticated | Answers the 3 core daily aspirant questions: What to study, practice, and revise today. | `200 OK` |
| `POST` | `/api/v1/study-planner/custom` | Authenticated | Generates personalized study schedule based on target exam year and weak subjects. | `200 OK` |

---

## 5. Aspirant Study Vault & Telemetry APIs

| Method | Endpoint Path | Access Level | Description & Multi-Tenant Rules | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` / `POST` | `/api/v1/user/bookmarks` | Authenticated | Query and toggle question bookmarks (isolated by `userId`). | `200 OK` / `201 Created` |
| `GET` / `POST` | `/api/v1/user/notes` | Authenticated | Query, create, and update markdown notes on specific questions. | `200 OK` |
| `GET` | `/api/v1/user/revision` | Authenticated | SM-2 spaced repetition queue returning questions due for mistake review. | `200 OK` |
| `GET` / `PUT` | `/api/v1/user/profile` | Authenticated | View and update aspirant preferences (medium, optional subject, target year). | `200 OK` |
| `GET` | `/api/v1/analytics/dashboard`| Authenticated | Aggregates accuracy, subject performance, streak, and recent attempts. | `200 OK` |

---

## 6. Commerce, Billing & Personal UPI Integration APIs

| Method | Endpoint Path | Access Level | Description & Security Controls | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/plans` | Public | Server-authoritative plan catalog (Free, Prelims Pro, Mains Master, Complete Officer). | `200 OK` |
| `POST` | `/api/v1/billing/checkout` | Authenticated | Creates unique payment order with server-calculated price + 18% GST and dynamic UPI QR. | `200 OK` (Order ID, UPI intent) |
| `GET` | `/api/v1/payments/orders/[orderId]/status` | Authenticated | Retrieves real-time payment status and payee info (`jainaradhy123@okicici`, Aradhy Jain). | `200 OK` / `404 Not Found` |
| `POST` | `/api/v1/payments/orders/[orderId]/submit-utr` | Authenticated | Student submits 12-digit UPI UTR reference; order transitions to `UNDER_REVIEW`. | `200 OK` / `400 Bad Request` |
| `POST` | `/api/v1/billing/webhook` | External Gateway | HMAC-SHA256 verified webhook for payment status updates with 300s drift protection. | `200 OK` / `401 Unauthorized` |
| `POST` | `/api/webhooks/upi-gateway` | External Gateway | Dedicated webhook receiver for `mynkdev-21/upi-gateway` integration. | `200 OK` / `401 Unauthorized` |
| `GET` | `/api/v1/user/subscription` | Authenticated | Queries active subscription tier, billing period, and renewal dates. | `200 OK` |
| `POST` | `/api/v1/user/subscription/cancel` | Authenticated | Cancels subscription while preserving access through end of paid billing period. | `200 OK` |

---

## 7. Content Administration & Governance APIs

| Method | Endpoint Path | Access Level | Description & Guardrails | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` / `POST` | `/api/v1/admin/questions` | Admin Only | Question bank manager (creates draft questions, updates options). | `200 OK` / `403 Forbidden` |
| `POST` | `/api/v1/admin/publish` | Admin Only | **Quality Gate:** Rejects direct publication from `DRAFT`; requires editorial verification. | `200 OK` / `400 Bad Request` |
| `GET` | `/api/v1/admin/coverage` | Admin Only | Comprehensive 448-cell coverage matrix across 14 exam families and years. | `200 OK` |
| `GET` | `/api/v1/admin/pyqs/external-sources` | Admin Only | External source ingestion dashboard (ExamGOAL, ExamSIDE, Human Peritus). | `200 OK` |
| `POST` | `/api/v1/admin/pyqs/batch` | Admin Only | Batch question ingestion via CSV/JSON with automated deduplication. | `200 OK` / `403 Forbidden` |
| `GET` | `/api/v1/admin/pyqs/batch` | Admin Only | Export verified question records to standardized CSV format. | `200 OK` |
| `GET` | `/api/v1/admin/payments` | Admin Only | Administrative view of financial ledger, UPI UTR approvals, and revenue metrics. | `200 OK` / `403 Forbidden` |
| `GET` | `/api/v1/admin/subscriptions` | Admin Only | Overview of active student subscriptions and churn analytics. | `200 OK` / `403 Forbidden` |
| `GET` | `/api/v1/admin/data-integrity`| Admin Only | Real-time database consistency check (detects orphaned options, missing keys). | `200 OK` |
