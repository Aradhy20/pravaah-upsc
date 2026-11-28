# PRAVAAH UPSC 2.0 — Implementation Roadmap

**Date:** November 28, 2026  
**Target Release:** PRAVAAH UPSC 2.0 Production Release  
**Architecture:** Next.js 14 + Prisma + PostgreSQL + Cashfree + AI Orchestrator  
**Lead:** Principal Full-Stack SaaS Architect  

---

## Milestone 1: Production Stabilization & Schema Self-Healing (Phase 1)
- [x] Audit codebase, physical database, and live production endpoints.
- [x] Empirically reconcile inventory claims (121 published Series A, 2,052 staged).
- [x] Generate 7 foundational audit reports.
- [ ] Extend `lib/db-sync.ts` with additive DDL for `Question.translationStatus` and bilingual columns.
- [ ] Purge deprecated payment routes (`app/api/webhooks/upi-gateway`, `app/api/v1/payments/orders/[orderId]/submit-utr`).
- [ ] Verify live `GET /api/v1/questions` returns HTTP 200 with zero schema errors.

---

## Milestone 2: Official Examination Taxonomy Architecture (Phase 2)
- [ ] Define comprehensive taxonomy data structures for all 14 official examination tracks:
  1. Civil Services Examination (CSE)
  2. Indian Forest Service (IFoS)
  3. Combined Defence Services (CDS)
  4. National Defence Academy (NDA)
  5. Central Armed Police Forces (CAPF AC)
  6. Combined Medical Services (CMS)
  7. Engineering Services Examination (ESE)
  8. Indian Economic Service (IES)
  9. Indian Statistical Service (ISS)
  10. Combined Geo-Scientist
  11. EPFO Enforcement Officer / Accounts Officer (EO/AO)
  12. EPFO Assistant Public Provident Commissioner (APFC)
  13. CISF AC (Executive) LDCE
  14. Historical Special Class Railway Apprentices (SCRA) Archive
- [ ] Implement administrative taxonomy management APIs and UI (`/admin/exams`).
- [ ] Support custom paper structures, eligibility criteria, and examination marking schemes.

---

## Milestone 3: Content Management System & Ingestion Pipeline (Phase 3)
- [ ] Upgrade `QuestionStagingRecord` to support full editorial review cycle:
  `DRAFT → IMPORTED → NEEDS_REVIEW → VERIFIED → PUBLISHED`.
- [ ] Build RFC 4180-compliant CSV batch importer in `/api/v1/admin/import/batch`.
- [ ] Add duplicate detection against existing booklet Series A records.
- [ ] Add one-click promotion tool from staging to published `Question` bank with official verification badges.

---

## Milestone 4: Prelims, Mains & Interview Engines (Phases 4, 5, 6)
- [ ] **Prelims Practice Engine:**
  - Option elimination strike-through.
  - Server-side answer-key protection during active timed sessions.
  - Exam-specific marking configurations (+2/-0.666 for CSE GS1, +2.5/-0.833 for CSAT).
- [ ] **Mains Preparation Engine:**
  - Timed answer-writing editor with word-count telemetry.
  - Multi-dimensional answer suggestion checklist (constitutional articles, committee reports).
  - Rubric-based evaluation engine (relevance, conceptual depth, structure).
- [ ] **Interview Preparation Board:**
  - DAF profile builder (home state, graduation subject, hobbies).
  - Conversational mock interview session with dynamic follow-up questioning.

---

## Milestone 5: Bilingual System & Signature Intelligence (Phases 7, 8, 9)
- [ ] Global English / हिंदी language switcher with persistent user preference.
- [ ] Hindi technical glossary bridge for constitutional and administrative terminology.
- [ ] Dynamic Knowledge Graph connecting Syllabus → NCERT → PYQ → Current Affairs → Mains.
- [ ] PYQ DNA Analyzer calculating historical concept repeat frequencies.
- [ ] Provider-independent AI layer with rate limiting, token usage telemetry, and mandatory source citations.

---

## Milestone 6: Cashfree Pure Billing & UI/UX Polish (Phases 10, 11, 12)
- [ ] Enforce Cashfree-exclusive checkout with canonical 4 plans:
  - `FREE`: ₹0
  - `BEGINNER`: ₹149/mo (mapped from PLUS)
  - `ACHIEVER`: ₹299/mo (mapped from PRO)
  - `SCHOLAR`: ₹499/mo (mapped from ELITE)
- [ ] Navy and teal identity refinement with clean, light SaaS surfaces and mobile navigation drawer.

---

## Milestone 7: Quality Assurance & Production Release (Phases 14, 15)
- [ ] Run full automated test suite: unit, integration, payment security, and bilingual tests.
- [ ] Verify production build (`npm run build`).
- [ ] Deploy to Vercel production and perform live smoke tests across all user journeys.
