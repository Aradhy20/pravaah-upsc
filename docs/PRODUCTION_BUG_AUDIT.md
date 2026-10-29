# Pravaah UPSC — Production Bug Audit & Diagnostic Report

**Audit Date:** October 2026  
**Target Environment:** Production (`https://pravaah-upsc.vercel.app/`)  
**Repository:** `Aradhy20/pravaah-upsc`  
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, SQLite  

---

## 1. Executive Summary

A public-site review of `https://pravaah-upsc.vercel.app/` identified critical production issues across public and authenticated routes:
- **P0:** `/mock-tests` returned HTTP 500 Internal Server Error.
- **P0:** `/current-affairs` and `/daily-quiz` remained stuck on initial loading indicators in rendered responses.
- **P0:** `/mains` displayed `Questions (0)` and `Loading questions...`.
- **P1:** `/exams` and `/study-planner` remained stuck on initial loading states.
- **P1:** `/dashboard` and `/pricing` displayed persistent loading indicators.
- **P1:** Discrepancies in historical coverage claims across marketing copy (e.g., 2011 vs 2014 vs 2019–2024 archive).

This audit documents the reproduction steps, root causes, affected routes, and the systematic engineering repair plan.

---

## 2. Issue Diagnosis & Root Cause Analysis

### Issue 1: `/mock-tests` Returns HTTP 500 Internal Server Error
* **Severity:** P0 (Critical)
* **Affected Route:** `app/mock-tests/page.tsx`
* **Reproduction:**
  1. Send an HTTP `GET /mock-tests` request to the deployed production website.
  2. Observe HTTP 500 Internal Server Error response.
* **Root Cause:**
  1. **Uncaught Async Exception in Server Component:** `app/mock-tests/page.tsx` is an `async` React Server Component. It executed `await prisma.test.findMany({ include: { paper: true, questions: true, sessions: ... } })` directly without a `try/catch` block.
  2. **Vercel Serverless File Tracing (NFT) Missing Database:** In Vercel serverless deployments (`/var/task`), Next.js uses Node File Tracing (`@vercel/nft`). Dynamic SQLite files (e.g., `prisma/dev.db`) are not statically imported by JavaScript and were therefore omitted from the serverless function bundle unless explicitly defined in `outputFileTracingIncludes` within `next.config.mjs`.
  3. When the serverless function initiated a Prisma connection to `/var/task/prisma/dev.db`, SQLite created a blank 0-byte file with no schema tables. Prisma threw `The table main.tests does not exist in the current database`. Next.js caught no error boundary and returned HTTP 500.

### Issue 2: `/current-affairs` & `/daily-quiz` Persistent Loading States
* **Severity:** P0 (Critical)
* **Affected Routes:** `app/current-affairs/page.tsx`, `app/daily-quiz/page.tsx`, `app/api/v1/current-affairs/route.ts`, `app/api/v1/quiz/daily/route.ts`
* **Reproduction:**
  1. Inspect the server-rendered HTML of `/current-affairs` or `/daily-quiz`.
  2. Observe `"Loading verified current affairs..."` or `"Loading today's quiz..."`.
* **Root Cause:**
  1. **Server-Side Pre-rendering of Client Components:** Both pages are `"use client"` components initialized with `loading: true`. The server-rendered HTML naturally outputs the loading spinner state.
  2. **Client Fetch Error Handling Without Recovery:** When client JavaScript executes `fetch()`, if the database is unreachable or the API returns `{ success: false }` or HTTP 500, the catch block logged to console but failed to set an informative error state, leaving the UI in an unrecovered state.
  3. **Missing Empty/Retry State:** No user-facing retry button or published status banner was rendered.

### Issue 3: `/mains` Reports `Questions (0)` and "Loading questions..."
* **Severity:** P0 (Critical)
* **Affected Routes:** `app/mains/page.tsx`, `app/api/v1/mains/route.ts`
* **Reproduction:**
  1. Navigate to `/mains` and inspect the question list drawer.
  2. Observe `Questions (0)` in the heading and `Loading questions...` in the list body.
* **Root Cause:**
  1. Initial SSR rendered `questions.length` (0) before client data was fetched.
  2. In production, if `/api/v1/mains?paper=GS1` returned an error or if the database was unbundled, the client fell back to `questions: []`.
  3. Lacked an explicit error banner with a retry trigger and lacked support for Essay (only GS1–GS4 were listed).

### Issue 4: `/exams` & `/study-planner` Loading States
* **Severity:** P1 (High)
* **Affected Routes:** `app/exams/page.tsx`, `app/study-planner/page.tsx`
* **Reproduction:**
  1. Fetch `/exams` and `/study-planner`.
  2. Observe persistent loading text in the pre-rendered response.
* **Root Cause:**
  1. Pre-rendered client components render loading states by default.
  2. The study planner relied solely on `/api/v1/study-planner/today` without an interactive planner generator for visitors or users without historical attempt data.

### Issue 5: `/dashboard` and `/pricing` Loading & Checkout Issues
* **Severity:** P1 (High)
* **Affected Routes:** `app/dashboard/page.tsx`, `app/pricing/page.tsx`, `app/api/v1/billing/checkout/route.ts`
* **Reproduction:**
  1. Pre-rendered output displayed loading states.
  2. On `/pricing`, clicking checkout while unauthenticated caused a server-side foreign key constraint failure in `prisma.paymentRecord.create` because `user.id` fell back to `guest-aspirant`, which does not exist in `users`.
* **Root Cause:**
  1. No client-side login check before checkout initiation.
  2. Missing error state UI for plan loading failures.

### Issue 6: Homepage & Question Bank Coverage Inconsistencies
* **Severity:** P1 (High)
* **Affected Routes:** `app/page.tsx`, `app/current-affairs/page.tsx`
* **Root Cause:**
  - Inconsistent marketing claims: Homepage mentioned "2014–2024 archive", subject cards mentioned "2011–2024", and Current Affairs mentioned "1,085+".
  - Actual published and verified database count is **1,079 UPSC CSE Prelims questions across 6 complete cycles (2019–2024 Series A: 600 GS1 + 479 CSAT)**.
  - Claims must be strictly reconciled with the verified database records.

---

## 3. Systematic Repair Plan

| Phase | Component | Action Items |
| :--- | :--- | :--- |
| **Phase 1** | Next.js Vercel Tracing | Configure `outputFileTracingIncludes` in `next.config.mjs` for `./prisma/dev.db` and `./prisma/schema.prisma`. |
| **Phase 2** | `app/mock-tests/page.tsx` | Wrap database query in `try/catch`. Render a resilient test catalogue with fallback items, clear negative marking rules (+2.0/-0.666 GS1, +2.5/-0.833 CSAT), and retry trigger. |
| **Phase 3** | `app/current-affairs/page.tsx` | Add explicit `error` state, retry button, source verification badges, and authentic empty state. |
| **Phase 4** | `app/daily-quiz/page.tsx` | Add error state with retry, enforce server-side anti-leak protection (no answers in GET payload), and clear "No quiz published for today" empty state. |
| **Phase 5** | `app/mains/page.tsx` | Add error boundary state, retry button, support GS1–GS4 and Essay, and honest "No questions published yet" empty state. |
| **Phase 6** | `app/exams/page.tsx` | Add error state and retry button for examination directory. |
| **Phase 7** | `app/study-planner/page.tsx` | Add interactive study plan generator with user inputs (target exam, stage, daily hours, target date, subject priorities) and feasible schedule generation. |
| **Phase 8** | `app/dashboard/page.tsx` | Add error handling and clean new-aspirant onboarding empty state. |
| **Phase 9** | `app/pricing/page.tsx` | Require authentication before checkout, clarify sandbox vs production gateway mode, and add error state for plan loading. |
| **Phase 10** | `app/page.tsx` | Reconcile all question count and year coverage claims to strictly state 1,079 verified Prelims questions (2019–2024 Series A). |
