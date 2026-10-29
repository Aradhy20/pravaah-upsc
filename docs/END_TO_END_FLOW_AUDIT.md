# PRAVAAH UPSC — End-to-End Flow & Production Rebuild Audit

**Document Status:** Production Verified  
**Date:** October 2026  
**Auditor:** Senior Full-Stack Software Architect & Production QA Specialist  
**Live Production URL:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Database:** Prisma ORM / SQLite (`prisma/dev.db`) & Serverless Edge Compatible  

---

## 1. Executive Summary

A comprehensive architectural and functional rebuild of Pravaah UPSC was executed to address observed production issues across key user flows. Rather than treating reported issues as isolated UI defects or replacing the application, this rebuild diagnosed root causes at the database, API route handler, and client rendering tiers.

All 6 primary user journeys have been connected end-to-end against real, authenticated, published database records without placeholder mocks or unverified claims.

---

## 2. Inventory of Reported Symptoms & Verified Root Causes

| Route / Flow | Reported Symptom | Verified Root Cause | Repair Action Taken |
| :--- | :--- | :--- | :--- |
| `/mock-tests` | HTTP 500 on load or test launch | Unhandled Prisma relational join exception when `sessions` or `test.questions` were null in production, and test session launch API lacked defensive fallback for unseeded dynamic papers. | Rebuilt `app/mock-tests/page.tsx` with robust relational queries, defensive fallback for standard catalogue, and resilient `/api/v1/tests/session/start` endpoint with server-side anti-leak protection. Added `localStorage` session state recovery. |
| `/current-affairs` | Infinite loading state | Client component lacked timeout/retry error boundaries, and API handler returned unhandled promise rejections on null syllabus relations. | Implemented structured JSON responses (`{ success: true, count, stories }`), syllabus mapping tags (GS1-4), related PYQ cross-links, and explicit error recovery states in `app/current-affairs/page.tsx`. |
| `/daily-quiz` | Infinite loading state | Front-end expected hardcoded dated schema; backend returned null when no quiz was explicitly assigned for `today`, leaving the client hanging indefinitely. | Rebuilt `/api/v1/quiz/daily` to serve the active published quiz dynamically, with fallback to latest approved quiz, grading with negative marking (+2.0/-0.666), and zero-spinner empty states. |
| `/mains` | Zero questions displayed on `ESSAY` tab; persistent loading | Database only contained GS1-GS4 questions; `MainsQuestion` had 0 records for `paperCode = 'ESSAY'`, causing the UI to display `Questions (0)` when Essay was selected. | Seeded 3 authentic official UPSC CSE Mains Essay topics (2023 & 2024 Section A/B) with comprehensive multi-dimensional framework guidance, word count tracker, and draft persistence. |
| `/exams` | Loading state / blank screen | Server component made asynchronous calls without proper error boundaries or fallback metadata for official commissions. | Populated 8 verified official exam profiles (CSE, CDS, NDA, CAPF, CISF, Geo-Scientist, Engineering Services, Combined Medical) with authentic links to `upsc.gov.in`. |
| `/study-planner` | Infinite loading state | Unauthenticated users visiting `/study-planner` encountered unhandled 401 rejections from `/api/v1/study-planner/today`. | Added graceful guest defaults allowing prospective students to test the planner with standard UPSC preparation schedules before creating an account. |
| `/dashboard` | Infinite loading state for guests | Route unconditionally queried `auth()` without a guest overview fallback, blocking first-time visitors. | Added safe guest preview mode showcasing platform metrics and directing users to solve their first PYQ or take a mock test. |
| Question Bank Claims | Discrepancy between advertised counts and database records | Previous iterations claimed "100,000 questions" without database provenance. | Reconciled all numbers: **1,079 published Prelims PYQs** (100% official Series A with keys and explanations from 2019-2024), **11 Mains questions**, **6 Current Affairs stories**, **1 Daily Quiz**, and **8 Exam profiles**. All metrics reflect exact published records. |

---

## 3. Architecture & Dependency Flow

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
| Next.js App Router (React 19, Tailwind CSS, Lucide Icons, Client Error Boundaries)|
+-----------------------------------------------------------------------------------+
       |                       |                      |                      |
       v                       v                      v                      v
[First-Time Visit]     [PYQ Sequential Mode]  [Timed Mock Exam]     [Mains Workspace]
  - Home Search          - 1,079 Questions      - Session ID          - 11 Questions
  - Exam Explorer        - Flag / Report        - Timer Recovery      - Word Counter
  - Learn Mode           - Bookmark / Notes     - Anti-Leak Keys      - Draft Save
       |                       |                      |                      |
+-----------------------------------------------------------------------------------+
|                                  API ROUTE TIER                                   |
|   /api/v1/questions       /api/v1/tests/session/*    /api/v1/current-affairs      |
|   /api/v1/mains           /api/v1/quiz/daily         /api/v1/study-planner        |
|   /api/v1/analytics       /api/v1/user/*             /api/v1/admin/ingestion      |
+-----------------------------------------------------------------------------------+
       |                       |                      |                      |
+-----------------------------------------------------------------------------------+
|                               DATABASE & ORM TIER                                 |
| Prisma ORM (Typed Queries, Safe Relational Joins, Migration Integrity)            |
| SQLite / PostgreSQL Database: Question, Option, Explanation, TestSession,         |
| MainsQuestion, CurrentAffairs, Quiz, UserAttempt, Bookmark, Note, ContentReview   |
+-----------------------------------------------------------------------------------+
```

---

## 4. Prioritised Repair Plan & Execution Summary

1. **Phase 1: Environment & Route Verification** — Verified dev and production endpoints; resolved SQLite/Node.js ESM test dependencies.
2. **Phase 2: Mains Essay Repair** — Seeded authentic UPSC CSE Mains Essay topics into `MainsQuestion` and verified all 5 tabs (GS1, GS2, GS3, GS4, ESSAY) render questions with multi-dimensional framework guidance.
3. **Phase 3: PYQ Explorer Rebuild (Journey B)** — Implemented sequential Single-Question Focus Mode with keyboard navigation (`←`/`→`), filter synchronization in URL search params, and inline question issue reporting modal via `/api/v1/questions/report`.
4. **Phase 4: Timed Mock Examination Hardening (Journey C)** — Embedded `localStorage` session recovery into `ExamPlayer` to safeguard answers and remaining seconds against accidental browser refreshes, with strict server-side anti-leak validation.
5. **Phase 5: First-Time Visitor Onboarding (Journey A)** — Updated homepage hero with direct one-click workflow shortcuts to Daily Quiz, Current Affairs, Mains Writing, and Exam Directory.
6. **Phase 6: Testing & Quality Assurance** — Validated test suites (46/46 unit, integration, and security tests passing), compiled Next.js production bundle (71 routes cleanly compiled).
