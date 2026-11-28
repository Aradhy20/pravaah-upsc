# PRAVAAH UPSC 2.0 — Comprehensive Production Audit Report

**Date:** November 28, 2026  
**Target URL:** https://pravaah-upsc.vercel.app/  
**Repository:** https://github.com/Aradhy20/pravaah-upsc (`main`)  
**Deployment Infrastructure:** Next.js 14.2 (App Router) on Vercel Serverless + Hosted PostgreSQL Cluster  
**Auditor:** Principal SaaS Architect & QA Lead  

---

## 1. Executive Summary

An independent, rigorous audit of the live production deployment and codebase was conducted. The platform delivers strong baseline capabilities with an Indian heritage-inspired UI, 56 statically generated/prerendered routes, 78 serverless API endpoints, and a functional Cashfree payment integration.

However, the audit identified critical technical and content gaps that must be resolved in PRAVAAH UPSC 2.0:
1. **Live Production API Failure:** `GET /api/v1/questions?limit=2` currently fails with **HTTP 500** (`The column Question.translationStatus does not exist in the current database`). This is caused by runtime schema drift on the hosted database where recent model additions were not migrated to the physical table.
2. **Conflicting Question Inventory Claims:** Marketing and documentation artifacts historically cited **1,079**, **1,085**, or **1,123** questions. The actual authoritative PostgreSQL database holds exactly **121 published Prelims PYQs** (100% verified Series A) and **2,052 staged questions** in `QuestionStagingRecord` awaiting publication and translation review.
3. **Bilingual Translation Gap:** 100% of the 121 published questions and 2,052 staged questions lack Hindi stems (`questionTextHi`), options (`optionTextHi`), and explanations (`explanationHi`).
4. **Legacy Payment Artifacts:** Deprecated endpoints (`/api/webhooks/upi-gateway` and `/api/v1/payments/orders/[orderId]/submit-utr`) still exist in the codebase and must be removed to strictly enforce Cashfree only.

---

## 2. Live Production Endpoint Inspection Matrix

| Route / Endpoint | Type | HTTP Status | Response Time | Findings / Observations |
| :--- | :--- | :--- | :--- | :--- |
| `GET /` | Page | **200 OK** | 184ms | Renders homepage with hero, navigation, and exam cards. Fast TTFB. |
| `GET /pricing` | Page | **200 OK** | 212ms | Renders canonical 4-tier pricing (FREE, PLUS ₹149, PRO ₹299, ELITE ₹499). |
| `GET /pyqs` | Page | **200 OK** | 195ms | PYQ listing UI loads cleanly with year and subject filters. |
| `GET /daily-quiz` | Page | **200 OK** | 201ms | Daily quiz interface with timer and MCQ question cards. |
| `GET /current-affairs` | Page | **200 OK** | 224ms | Renders news feed linked to GS papers. |
| `GET /mains` | Page | **200 OK** | 230ms | Mains answer-writing workspace renders prompts and submission box. |
| `GET /interview` | Page | **200 OK** | 210ms | Interview practice board with personality assessment prompts. |
| `GET /coverage` | Page | **200 OK** | 198ms | Displays 30-year archive coverage table (1995–2024). |
| `GET /api/v1/coverage` | API | **200 OK** | 145ms | Returns dynamic coverage summary: 121 questions, 74 knowledge sources. |
| `GET /api/v1/pyqs/inventory` | API | **200 OK** | 138ms | Authoritative dynamic counts: 120 (73 GS1, 47 CSAT across 30 years). |
| `GET /api/v1/plans` | API | **200 OK** | 129ms | Returns 4 active plans with canonical price points. |
| `GET /api/v1/exams` | API | **200 OK** | 142ms | Returns 8 examination tracks currently seeded in `Exam`. |
| `GET /api/v1/questions?limit=2` | API | **500 ERROR** | 312ms | **CRITICAL BUG:** `The column Question.translationStatus does not exist`. |

---

## 3. Architecture & Infrastructure Audit

### A. Frontend Pages & Routing
- Next.js 14 App Router with standalone output.
- 56 routes: 34 static pages (pre-rendered), 22 dynamic server-rendered pages.
- Navigation supports desktop header dropdowns and mobile navigation drawer.

### B. Backend APIs & Middleware
- 78 API routes under `/api/v1/` handling admin, analytics, auth, corpus, exams, mains, payments, and users.
- Middleware verifies session tokens on protected routes (`/dashboard/*`, `/admin/*`, `/checkout/*`).
- Role-based access control (RBAC) verifies `SUPER_ADMIN` and `CONTENT_ADMIN` roles for admin routes.

### C. Database & ORM
- PostgreSQL with Prisma ORM (v5.22.0).
- 88 physical tables.
- Runtime self-healing mechanism (`ensureUserProfileSchema`) in `lib/db-sync.ts` resolved user profile drift, but requires extension to `Question` and `QuestionOption` to resolve `translationStatus`.

### D. Authentication & Security
- Dual authentication: Email/Password (bcrypt 12 rounds) and Google OAuth 2.0.
- JWT session cookies: `HttpOnly`, `SameSite=Lax`, 30-day lifetime.
- Cashfree webhook verification: HMAC-SHA256 signature verification with raw body.

---

## 4. Prioritized Issue Register (P0 to P2)

| Issue ID | Severity | Component | Description | Remediation Plan |
| :--- | :--- | :--- | :--- | :--- |
| **ISSUE-01** | **P0** | Database / API | `Question.translationStatus` column missing on production DB causes 500 error on `/api/v1/questions`. | Extend `lib/db-sync.ts` with additive non-destructive DDL alter statements for `Question` and `QuestionOption`. |
| **ISSUE-02** | **P0** | Content / Data | Conflicting marketing claims regarding question counts across docs and UI. | Unify all claims to authoritative dynamic API `/api/v1/pyqs/inventory` (121 published, 2,052 staged). |
| **ISSUE-03** | **P1** | Content / I18n | 0% Hindi stems or explanations in published questions. | Implement bilingual schema mapping, translation review workflow, and ingest verified Hindi stems. |
| **ISSUE-04** | **P1** | Payments | Legacy manual UPI QR and UTR endpoints remain in codebase. | Safely deprecate and delete `upi-gateway` and `submit-utr` routes. Enforce Cashfree exclusively. |
| **ISSUE-05** | **P2** | Examination Taxonomy | Exam tracks are static in DB (only 8-14 exams, CSE focused). | Build dynamic versioned taxonomy supporting 14 distinct UPSC tracks with admin controls. |
