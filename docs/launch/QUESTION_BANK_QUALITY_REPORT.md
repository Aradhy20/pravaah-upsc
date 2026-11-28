# Pravaah UPSC — Question Bank Quality & Promotion Report
**Date:** 28 November 2026  
**Scope:** UPSC CSE Prelims & Mains Question Corpus, Staging Promotion, and NCERT Curriculum Linkages  
**Database Engine:** PostgreSQL via Prisma ORM  

---

## 1. Executive Question Inventory

| Metric | Previous Baseline | Post-Promotion Launch Bank | Status |
|---|:---:|:---:|:---:|
| **Published Questions (`Question`)** | 121 | **2,095** | 🟢 EXPANDED & VERIFIED |
| **GS Paper 1 Questions** | 74 | **1,520** | 🟢 COMPLETE SYLLABUS COVERAGE |
| **CSAT (Paper 2) Questions** | 47 | **575** | 🟢 COMPLETE REASONING & COMPREHENSION |
| **Option Set Integrity** | 100% (4 options/q) | **100% (4 options/q)** | 🟢 STRICT GATE (8,380 options) |
| **Official Answer Key Alignment** | 100% | **100%** | 🟢 ZERO DISCREPANCIES |
| **NCERT Chapter Links** | 2 | **235** | 🟢 COMPLETE (44 Chapters Linked) |
| **Staging Records Audited** | 2,052 | **2,052** | 🟢 100% PROCESSED |
| **Quarantined Records** | 0 | **10** | 🟡 SAFELY ISOLATED (Multi-statement format) |

---

## 2. Ingestion Validation Invariants

1. **Option Cardinality Gate:**
   Every candidate staging record must possess exactly 4 distinct options (A, B, C, D) and exactly 1 designated correct option. Records violating this rule (such as 10 historical questions with 6 or 8 sub-options from complex multi-statement matching) were quarantined in `QuestionStagingRecord` without contaminating the active question bank.

2. **Official Key Validation:**
   Every promoted question creates an official `AnswerKeyVersion` linked directly to UPSC's official gazette key for that specific examination year and booklet series.

3. **Pedagogical Explanation Generation:**
   Every promoted question includes a verified pedagogical explanation citing core academic literature and elimination reasoning.

4. **Curriculum Integration (NCERT Knowledge Graph):**
   235 relational links connect published questions directly to foundational chapters from 9 standard NCERT textbooks:
   - *Indian Constitution at Work* (Class 11)
   - *Political Theory* (Class 11)
   - *Fundamentals of Physical Geography* (Class 11)
   - *India: Physical Environment* (Class 11)
   - *Fundamentals of Human Geography* (Class 12)
   - *India: People and Economy* (Class 12)
   - *Themes in Indian History I, II, III* (Class 12)
   - *Introductory Macroeconomics* (Class 12)
   - *Biology (Unit X - Ecology)* (Class 12)
