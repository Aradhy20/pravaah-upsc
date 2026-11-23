# PHASE 2: PRODUCTION BASELINE AUDIT
**Application:** Pravaah UPSC  
**Live URL:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**GitHub Repository:** [https://github.com/Aradhy20/pravaah-upsc](https://github.com/Aradhy20/pravaah-upsc)  
**Branch:** `main`  
**Phase 2 Baseline Commit:** `353c38d`  
**Audit Date:** November 23, 2026  
**Auditor:** Principal QA & Full-Stack Reliability Engineering Team  

---

## 1. Executive Summary

This document establishes the verified technical baseline of the Pravaah UPSC production platform at the inception of Phase 2. Prior audits addressed the initial backend recovery, database connectivity on Vercel, and the safe decommissioning of previous payment gateways in preparation for a future Cashfree integration.

The objective of Phase 2 is to conduct a rigorous, independent quality assurance audit across all application tiers (frontend, backend, database, security, and performance), fix all identified functional and security vulnerabilities, verify complete bilingual and curriculum integrity, and achieve 100% automated test coverage.

---

## 2. Infrastructure & Hosting Architecture

| Component | Provider / Technology | Configuration & Status |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14.2.35 (App Router) | Hybrid static pre-rendering (46 routes) & dynamic server routes |
| **Runtime & Hosting** | Vercel Serverless / Edge Platform | Global CDN edge caching, Node.js 18.x serverless runtime |
| **Primary Database** | PostgreSQL 16 (Vercel Postgres / Neon) | Pooled connection via `STORAGE_DATABASE_URL_POOLED` |
| **Direct Migration DB** | PostgreSQL 16 (Direct access) | Unpooled direct connection via `DIRECT_URL` / `STORAGE_DATABASE_URL` |
| **Object / Relational ORM**| Prisma ORM v5.22.0 | Complete type-safe client with 70 relational models |
| **Local Verification DB**| Docker PostgreSQL 16 (`pravaah_upsc`) | Complete parity with 121 verified Prelims & 32 Mains questions |

---

## 3. Database State at Baseline

A comprehensive schema and record audit confirmed the live PostgreSQL database state:

- **Total Relational Tables:** 70 tables declared in `prisma/schema.prisma` and synchronized in PostgreSQL.
- **Active Data Source:** Confirmed live PostgreSQL query execution (`x-data-source: POSTGRESQL`). The JSON filesystem fallback remains purely a disaster-recovery failsafe and is inactive.
- **Prelims Question Bank:**
  - Total records: 121 authentic questions.
  - Published records: 120 published (1 question in review `NEEDS_REVIEW` scheduled for promotion).
  - Subject breakdown: History (22), Geography (20), Polity (21), Economy (22), Environment (16), Science & Tech (10), CSAT (10).
- **Mains Question Bank:**
  - Total records: 32 authentic questions covering GS1 (8), GS2 (8), GS3 (8), GS4 (8).
- **Bilingual Records:**
  - 41 questions with authentic UPSC Devanagari Hindi translations.
  - 80 questions English-only (verified authentic UPSC papers; zero machine-translated or fabricated Hindi content).
- **Current Affairs Records:**
  - 56 published stories linked to official government ministries and syllabus tags.
- **Subscription Plans:**
  - 4 tiers configured (`FREE`, `ASPIRANT_PRO`, `PRELIMS_MAINS_COMBO`, `INSTITUTIONAL_ANNUAL`).

---

## 4. Payment Architecture Status at Baseline

- **Old Gateway Decommissioning:** Confirmed complete in commit `353c38d`. Razorpay/Cashfree direct checkouts are safely blocked.
- **Checkout Guard:** `POST /api/v1/payments/create-order` and `POST /api/v1/billing/checkout` return HTTP 503 (`PAYMENTS_DISABLED`) with informative user messages.
- **Webhook Guard:** Webhook endpoints return HTTP 503 and perform zero database write actions.
- **Free Learning Operations:** 100% operational. Unauthenticated and free users retain full access to Prelims PYQ Explorer, Daily Current Affairs, Daily Quiz, NCERT resources, and Video Academy.

---

## 5. Identified Baseline Gaps for Phase 2 Resolution

1. **Authentication Security Bypass:** `app/api/v1/auth/login/route.ts` permitted password prefix bypass for demo accounts.
2. **Account Hardening:** Default credentials for `admin@pravaah.in` and `aspirant@pravaah.in` required cryptographic SHA-256 password salting.
3. **Data Isolation for Unauthenticated Visitors:** `getCurrentUser` previously defaulted unauthenticated visitors to `aspirant@pravaah.in`, leading to potential leakage of bookmarks and test attempts.
4. **Mock Test Catalog Discrepancy:** The mock test listing displayed fallback question counts (`36`) for tests with zero linked questions.
5. **Database Reconciler Automation:** Need automated promotion of all verified questions with complete options and explanations to `PUBLISHED` status.
6. **Automated Test Coverage:** Existing test suites required a dedicated Phase 2 regression suite covering all fixed vulnerabilities.
