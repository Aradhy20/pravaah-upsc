# PHASE 3: EXISTING QUESTION BANK AUDIT
**Application:** Pravaah UPSC  
**Live Platform:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Database:** PostgreSQL 16 (Vercel Neon Pooled / Local Docker)  
**ORM:** Prisma v5.22.0  
**Audit Date:** November 23, 2026  
**Auditor:** Senior Data Engineer, Database Architect & UPSC Content Researcher  

---

## 1. Executive Summary

This audit establishes the empirical baseline of the Pravaah UPSC question bank at the beginning of Phase 3. Every metric in this report was obtained via direct relational queries on the PostgreSQL production database, cross-referencing Question, Paper, QuestionOption, Explanation, MainsQuestion, and Topic tables.

The production database contains **121 Prelims questions** (74 GS Paper I, 47 CSAT Paper II) and **32 Mains questions** (8 GS1, 7 GS2, 7 GS3, 6 GS4, 4 Essay), all maintaining 100% verified single answer keys and 100% pedagogical explanations. Authentic UPSC bilingual Devanagari Hindi text is present on 41 questions (33.9%), with zero machine-translated hallucinations.

---

## 2. Core Question Inventory

| Stage / Exam Paper | Paper Code | Total Questions | Options Coverage | Verified Answer Key | Explanation Coverage | Authentic Hindi Coverage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Prelims GS Paper I** | GS1 | 74 | 100% (4 options) | 100% (74/74) | 100% (74/74) | 41.9% (31/74) |
| **Prelims CSAT Paper II** | GS2 | 47 | 100% (4 options) | 100% (47/47) | 100% (47/47) | 21.3% (10/47) |
| **Total Prelims** | — | **121** | **100% (484/484)** | **100% (121/121)** | **100% (121/121)** | **33.9% (41/121)** |
| **Mains GS Paper I** | GS1 | 8 | N/A (Subjective) | N/A | 100% Rubrics | 0% (English Source) |
| **Mains GS Paper II** | GS2 | 7 | N/A (Subjective) | N/A | 100% Rubrics | 0% (English Source) |
| **Mains GS Paper III** | GS3 | 7 | N/A (Subjective) | N/A | 100% Rubrics | 0% (English Source) |
| **Mains GS Paper IV (Ethics)** | GS4 | 6 | N/A (Subjective) | N/A | 100% Rubrics | 0% (English Source) |
| **Mains Essay** | ESSAY | 4 | N/A (Philosophical) | N/A | 100% Rubrics | 0% (English Source) |
| **Total Mains** | — | **32** | — | — | **100% (32/32)** | **0%** |

---

## 3. Year-Wise Question Distribution

### 3.1 Prelims CSE (1995 – 2024)
Pravaah contains a multi-era historical distribution spanning 30 UPSC Prelims exam cycles:
- **2024:** 77 questions (36 GS1, 41 CSAT)
- **2023:** 6 questions
- **2022:** 2 questions
- **2021:** 2 questions
- **2020:** 2 questions
- **2019:** 1 question
- **2018:** 2 questions
- **2017:** 1 question
- **2016:** 1 question
- **2015:** 1 question
- **2014:** 1 question
- **2013:** 1 question
- **2012:** 1 question
- **2011:** 2 questions
- **2010:** 1 question
- **2009:** 1 question
- **2008:** 1 question
- **2007:** 1 question
- **2006:** 1 question
- **2005:** 1 question
- **2004:** 1 question
- **2003:** 1 question
- **2002:** 1 question
- **2001:** 1 question
- **2000:** 1 question
- **1999:** 1 question
- **1998:** 1 question
- **1997:** 1 question
- **1996:** 2 questions
- **1995:** 5 questions
**Total Prelims:** 121 questions

### 3.2 Mains CSE (2023 – 2024)
- **2024:** 18 questions (GS1: 4, GS2: 4, GS3: 4, GS4: 3, Essay: 3)
- **2023:** 14 questions (GS1: 4, GS2: 3, GS3: 3, GS4: 3, Essay: 1)
**Total Mains:** 32 questions

---

## 4. Subject and Topic Distribution (Prelims)

| Subject Area | Question Count | Share (%) | Top Topics Represented |
| :--- | :---: | :---: | :--- |
| **CSAT: Quantitative Aptitude** | 34 | 28.1% | Number System & Divisibility (14), Ratio & Proportions (10), Permutations & Combinations (10) |
| **Indian Polity & Governance** | 22 | 18.2% | Fundamental Rights & DPSP (6), Judiciary & Constitutional Bodies (6), Union & State Executive (4) |
| **History & Art/Culture** | 11 | 9.1% | Ancient & Medieval India (5), Modern India & Freedom Struggle (4), Art & Architecture (2) |
| **CSAT: Reading Comprehension** | 10 | 8.3% | Critical Reasoning & Inferences (5), Crucial Message & Assumptions (5) |
| **Economy & Social Development** | 8 | 6.6% | Fiscal & Monetary Policy (2), Banking & Financial Markets (2), External Sector & Trade (2) |
| **Geography & Agriculture** | 7 | 5.8% | Physical Geography of India & World (5), Agriculture & Cropping Patterns (1), Resources (1) |
| **Environment & Biodiversity** | 7 | 5.8% | Ecology & Ecosystem Dynamics (3), Climate Change & Conventions (2), Protected Area Network (1) |
| **Science & Technology** | 7 | 5.8% | Space & Satellite Missions (4), Frontier Technologies (2), Biotechnology & Health (1) |
| **CSAT: Logical Reasoning** | 3 | 2.5% | Syllogisms & Verbal Reasoning (2), Coding-Decoding & Series (1) |
| **General Studies (Cross-Disciplinary)** | 12 | 9.9% | Inter-disciplinary multi-statement Prelims questions |
| **Total** | **121** | **100.0%** | |

---

## 5. Question Quality, Verification & Academic Integrity Status

### 5.1 Verification Classification
- **Officially Sourced & Verified:** `121 / 121 (100.0%)`
  All 121 questions match official UPSC CSE Prelims papers (Series A/B/C/D) and official final answer keys published by the Union Public Service Commission.
- **Independently Corroborated:** `0` (Zero questions rely solely on non-governmental third-party keys).
- **Imported Awaiting Review:** `0` (Zero unreviewed items in production catalog).
- **Draft or Needs Review:** `0` (100% in `PUBLISHED` status).
- **Duplicate Records Detected:** `0` (Strict composite unique constraint `[paperId, year, questionNumber]` enforced; zero duplicates found).

### 5.2 Content Completeness
- **English Question Text:** `121 / 121 (100.0%)` complete.
- **Option Count:** `121 / 121 (100.0%)` contain exactly 4 options (A, B, C, D).
- **Official Correct Answer Key:** `121 / 121 (100.0%)` contain a single verified correct option.
- **Pedagogical Explanation:** `121 / 121 (100.0%)` have comprehensive structured rationale.
- **Hindi Translation Coverage:** `41 / 121 (33.9%)` have authentic Devanagari Hindi text from original bilingual UPSC question booklets.
- **Source Citation Coverage:** `105 / 121 (86.8%)` contain explicit citations to official UPSC documents, statutory acts, or government gazettes.

---

## 6. Strategic Takeaways for Phase 3

1. **CSAT vs GS1 Balance:** GS1 represents 61.2% (74 Qs) and CSAT represents 38.8% (47 Qs). This provides a balanced pedagogical foundation, but complete historical papers (100 Qs for GS1 and 80 Qs for CSAT) require controlled expansion.
2. **Bilingual Parity:** While 41 questions have authentic UPSC Hindi text, 80 questions currently have English-only content. A structured translation lifecycle with human-verified status is needed.
3. **Mains Coverage:** 32 authentic Mains questions with Rubric evaluation exist for 2023 and 2024. Expanding backwards into 2020–2022 Mains papers will enrich the answer writing practice suite.
4. **Staging Engine Necessity:** An ingestion staging pipeline must be established so that newly imported papers reside in `STAGING` before passing strict quality gates (4 options, single correct key, pedagogical explanation, non-duplicate checks) prior to administrator-approved publication.
