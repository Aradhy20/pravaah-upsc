# PRAVAAH UPSC 2.0 — Feature Gap Analysis Report

**Date:** November 28, 2026  
**Scope:** Comparison of Existing Features vs. PRAVAAH UPSC 2.0 Product Vision  
**Auditor:** Principal Product Architect & Full-Stack Lead  

---

## 1. Domain-by-Domain Feature Evaluation

| Phase / Module | Current Implementation Status | Production Gap | PRAVAAH 2.0 Target Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 2: Examination Taxonomy** | 14 hardcoded records in `Exam`. UI heavily focused on CSE. | Lacks dynamic admin taxonomy management for other 13 UPSC tracks (IFoS, CAPF, CDS, NDA, CMS, ESE, etc.). | Admin-managed, versioned taxonomy with custom syllabus, paper structures, and marking rules. |
| **Phase 3: CMS & Review Pipeline** | Basic staging table (`QuestionStagingRecord`) with 2,052 items. | Lacks integrated OCR/PDF extraction UI, bilingual side-by-side translation editor, and batch promotion button. | End-to-end CMS with RFC 4180 CSV importer, PDF extractor, duplicate detection, and promotion gates. |
| **Phase 4: Prelims Practice Engine** | Working PYQ list and quiz runner. `/api/v1/questions` has 500 error. | Lacks server-side answer-key hiding during active exam, option elimination strike-through, and configurable negative marking per exam. | Coding challenge-inspired practice environment with split-view explanations, elimination strike-through, and exam simulator. |
| **Phase 5: Mains Preparation Engine** | Basic question cards and text box saving to `/api/v1/mains/draft`. | Lacks timed word counter, multi-dimensional feedback checklist, and model answer comparison lab. | Timed Mains workspace with rubric-based AI analysis (evidence-based, clearly labeled as estimate) and faculty review option. |
| **Phase 6: Interview Preparation** | Static interview prompts page. | Lacks DAF builder and realistic conversational follow-up questioning. | Conversational interview board that parses student DAF and asks dynamic follow-up policy dilemmas. |
| **Phase 7: Bilingual Content System** | English only active across questions and UI. | 0% Hindi stems/options/explanations. Missing Hindi technical glossary. | Complete EN/हिंदी switch, bilingual database fields (`stemHi`, `optionTextHi`), glossary bridge. |
| **Phase 8: Signature Intelligence** | Mock/static visualizations on marketing pages. | Real database records are not wired into dynamic Knowledge Graph or PYQ DNA trends. | Live Knowledge Graph linking Syllabus -> NCERT -> PYQ -> News, PYQ DNA trend analyzer, and personal weakness generator. |
| **Phase 9: AI System Architecture** | Hardcoded AI mock handlers in `/api/v1/ai/*`. | Lacks provider-independent orchestration, token rate limits, and verified citation constraints. | Multi-provider AI service layer with token budgets, citation tracking, and strict anti-hallucination rules. |
| **Phase 10: Admin Dashboard** | 10 sub-pages in `/admin/*`. | Missing translation review console and bulk promotion controls. | Unified admin control center with user, exam, content, revenue, and translation workflows. |
| **Phase 11: Payment & Subscription** | Cashfree production integration verified. | Legacy manual payment routes (`upi-gateway`, `submit-utr`) remain in source code. | Purge all legacy payment files. Cashfree only with 4 canonical tiers (FREE, BEGINNER, ACHIEVER, SCHOLAR). |
| **Phase 12: UI/UX & Mobile** | Indian heritage burgundy/gold visual design. | Mobile drawer exists but needs polish on practice split-screens. | Navy and teal accent refinement, high-contrast readable typography, accessible mobile touch targets. |
| **Phase 13: Database Schema** | 88 tables; runtime drift on `Question.translationStatus`. | Database requires normalization of bilingual and taxonomy fields. | Reversible, additive self-healing migration covering all models without dropping historical data. |

---

## 2. Priority Action Matrix

```
┌─────────────────────────────────────────────────────────────┐
│ P0: IMMEDIATE PRODUCTION REPAIRS (Day 1)                    │
│ 1. Fix Question.translationStatus schema drift.             │
│ 2. Remove legacy manual UPI/UTR payment routes.             │
│ 3. Unify question inventory metrics across UI.              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ P1: CORE ENGINE EXPANSION (Day 2 - 3)                       │
│ 1. Dynamic 14-track examination taxonomy engine.            │
│ 2. Prelims practice engine with server-side protection.     │
│ 3. Mains workspace with rubric evaluation.                  │
│ 4. Bilingual framework & Hindi translation review console.   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ P2: SIGNATURE INTELLIGENCE & CMS (Day 4 - 5)                │
│ 1. Centralized CMS with RFC 4180 CSV / PDF ingestion.       │
│ 2. Dynamic Knowledge Graph & PYQ DNA Analyzer.              │
│ 3. Conversational DAF Interview Board.                      │
│ 4. Provider-independent AI layer with citation guardrails.  │
└─────────────────────────────────────────────────────────────┘
```
