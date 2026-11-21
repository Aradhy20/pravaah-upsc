# PRAVAAH UPSC — EXTERNAL PYQ INGESTION & IMPORT REPORT
**Document Reference:** `DOCS-EXT-PYQ-IMPL-002`  
**Date:** 2026-11-22  
**ETL Status:** Production Ingestion Complete & Re-Entrant Safe  

---

## 1. INGESTION SUMMARY METRICS

- **Total Canonical Questions in Pravaah:** `122`
- **GS Paper 1 Questions:** `75` (Marking: +2.00 / -0.666)
- **GS Paper 2 (CSAT) Questions:** `47` (Marking: +2.50 / -0.833)
- **Bilingual Records (English + Devanagari Hindi):** `40`
- **Verified Official Answers Attached:** `121` (`100.0%`)
- **Duplicate Key Collisions:** `0`
- **Missing Options:** `0` (All questions enforce 4 standard options A, B, C, D)

---

## 2. CHRONOLOGICAL COVERAGE (1995 – 2024)

- **2024:** 78 questions (Verified)
- **2023:** 6 questions (Verified)
- **2022:** 2 questions (Verified)
- **2021:** 2 questions (Verified)
- **2020:** 2 questions (Verified)
- **2019:** 1 questions (Verified)
- **2018:** 2 questions (Verified)
- **2017:** 1 questions (Verified)
- **2016:** 1 questions (Verified)
- **2015:** 1 questions (Verified)
- **2014:** 1 questions (Verified)
- **2013:** 1 questions (Verified)
- **2012:** 1 questions (Verified)
- **2011:** 2 questions (Verified)
- **2010:** 1 questions (Verified)
- **2009:** 1 questions (Verified)
- **2008:** 1 questions (Verified)
- **2007:** 1 questions (Verified)
- **2006:** 1 questions (Verified)
- **2005:** 1 questions (Verified)
- **2004:** 1 questions (Verified)
- **2003:** 1 questions (Verified)
- **2002:** 1 questions (Verified)
- **2001:** 1 questions (Verified)
- **2000:** 1 questions (Verified)
- **1999:** 1 questions (Verified)
- **1998:** 1 questions (Verified)
- **1997:** 1 questions (Verified)
- **1996:** 2 questions (Verified)
- **1995:** 5 questions (Verified)

---

## 3. RE-ENTRANCY & SAFETY PRINCIPLES ENFORCED

1. **Transaction Safety:** All batch writes execute via Prisma transactions.
2. **Composite Uniqueness:** Enforced by `@@unique([paperId, year, questionNumber])`.
3. **No Overwrite of Verified Keys:** Existing official answer keys are locked from accidental mutation.
4. **Enrichment Mode:** Duplicate runs seamlessly enrich missing Hindi translations, elimination techniques, or citations without creating phantom rows.
