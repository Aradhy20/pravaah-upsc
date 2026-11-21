# PRAVAAH UPSC — PYQ COVERAGE GAP & EXPANSION ROADMAP
**Document Reference:** `DOCS-EXT-PYQ-GAPS-004`  
**Date:** 2026-11-22  
**Status:** Ongoing Expansion Strategy  

---

## 1. CURRENT COVERAGE AUDIT

- **Full Year Span (1995 – 2024):** All 30 examination years have authentic, verified questions seeded.
- **Deep Modern Set (2024):** 76 questions (GS1 + CSAT) with full options, keys, and explanations.
- **Historical Baseline (1995 – 2023):** Core verified benchmark questions established for every single year.

---

## 2. IDENTIFIED GAPS & MITIGATION PLAN

| Gap Description | Severity | Current Status | Mitigation Strategy |
|---|---|---|---|
| **Historical Full 100Q Ingestion** (Pre-2024 years with 1-5 sample questions) | Medium | Baseline established; complete 100Q sets in progress | Run batch extraction via `npm run pyq:extract -- --year {year}` and `npm run pyq:import` |
| **Devanagari Hindi Completeness** | Medium | 39 / 120 bilingual | Ingest bilingual PDF streams from ExamGOAL `hi.pdf` CDN |
| **Other UPSC Recruitment Exams** (CAPF, CDS, EPFO, CISF, Geo-Scientist) | Low | Exam category tabs active in UI | Ingest specialized recruitment papers into `examCategory = 'CAPF' | 'CDS' | 'EPFO'` |
| **Third-Party Solution Licensing** | High | Compliant | Do not republish third-party coaching notes without formal bilateral agreement. Ground all explanations in official NCERT and standard academic references. |
