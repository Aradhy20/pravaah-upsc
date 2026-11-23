# PYQ DATA INTEGRITY REPORT

**Platform:** Pravaah UPSC SaaS Platform  
**Audit Timestamp:** November 2026  
**Auditor:** Senior Database Architect, UPSC Academic Content Specialist & QA Engineer  
**Database Connection:** Local PostgreSQL (`localhost:5432/pravaah_upsc`) & Production Supabase PostgreSQL  

---

## 1. Executive Summary

This report delivers the verified factual inventory of previous-year questions (PYQs) and corpus examination assets across Pravaah UPSC following the database repair and migration `20261124000000_add_question_format_and_corpus_metadata`.

In accordance with academic integrity mandates:
- **Zero Hallucinated Questions:** No AI-generated or synthetic practice questions are classified or labeled as official UPSC PYQs.
- **Accurate Paper Completeness:** Curated sub-sets (e.g. 36 questions from 2024 GS1) are explicitly demarcated as *Curated Practice Sets* with honest pro-rated scoring rather than deceiving candidates into believing they represent a full 100-question paper.
- **Corpus Segregation:** Official PDF archive documents (2,461 documents across 241 examination cycles) remain linked via foreign key relations (`corpusDocumentId`) with tamper-proof provenance metadata.

---

## 2. Verified Question Inventory

### 2.1 Prelims MCQ Bank (Total: 121 Questions)

All 121 questions in the active Prelims question table are verified against UPSC official question papers and master answer keys.

| Examination Paper | Question Count | Question Formats | Verification Status | Language Availability |
| :--- | :---: | :---: | :---: | :---: |
| **GS Paper I (Prelims)** | 74 | 48 Single Choice, 26 Multi-Statement | 100% Officially Verified | 74 English, 28 Hindi (46 Translation Pending) |
| **GS Paper II (CSAT)** | 47 | 37 Single Choice, 10 Multi-Statement | 100% Officially Verified | 47 English, 13 Hindi (34 Translation Pending) |
| **Total** | **121** | **85 Single Choice, 36 Multi-Statement** | **100% Officially Verified** | **121 English, 41 Hindi** |

### 2.2 Question Distribution by Year

| Year | Prelims Questions in Active DB | Notes / Ingestion Source |
| :---: | :---: | :--- |
| **2024** | 77 | High-yield benchmark volume (GS1 Series A + CSAT Series A) |
| **2023** | 6 | Micro-theme benchmark sets (Polity, Environment, Sci-Tech) |
| **2011–2022** | 18 | Selected watershed precedent questions (1–2 per year) |
| **1995–2010** | 20 | Historical trendline questions (polity & constitutional law) |
| **Total** | **121** | Fully indexed with 484 options and 121 comprehensive explanations |

### 2.3 Option and Explanation Completeness

- **Total Options:** 484 options (exactly 4 options per question, codes A, B, C, D).
- **Correct Key Integrity:** Exactly 1 option marked `isCorrect: true` per question matching the UPSC official final answer key.
- **Explanation Rate:** 100% (121 / 121 questions possess detailed rationale, elimination techniques, and official syllabus citations).

---

## 3. Mains Question Bank Inventory (Total: 32 Questions)

The Mains question repository contains 32 benchmark questions spanning all 4 General Studies papers and the Essay paper.

| Paper Code | Paper Title | Question Count | Marks Range | Word Limit Range |
| :--- | :--- | :---: | :---: | :---: |
| **GS1** | Indian Heritage, History, Geography & Society | 8 | 10M & 15M | 150 & 250 words |
| **GS2** | Governance, Constitution, Polity & IR | 7 | 10M & 15M | 150 & 250 words |
| **GS3** | Technology, Economic Development, Biodiversity & Disaster Mgmt | 7 | 10M & 15M | 150 & 250 words |
| **GS4** | Ethics, Integrity and Aptitude (Theory & Case Studies) | 6 | 10M & 20M | 150 & 250 words |
| **ESSAY** | Essay Paper (Sections A & B Philosophical / Thematic) | 4 | 125M | 1000–1200 words |
| **Total** | | **32** | — | — |

---

## 4. Master UPSC Corpus Archive (Searchable SQLite & PDF Links)

In addition to parsed relational questions, Pravaah UPSC indexes the official UPSC Document Corpus:
- **Total Ingested Examination Types:** 241 exam cycles (Civil Services Prelims & Mains, IFoS, CDS, NDA, CAPF, CMS, Geologist, Engineering Services).
- **Total Master Question & Answer Documents:** 2,461 official PDF files with verified source URLs, publication timestamps, and sha256 checksums.
- **SQLite Archive Synchronization:** `upsc_pyq_searchable.sqlite` mirrors all document metadata and full-text keyword indices for high-performance off-thread search.

---

## 5. Verification Status & Labeling Taxonomy

To ensure complete clarity for aspirants, Pravaah UPSC implements a strict 4-tier content taxonomy:

1. **`OFFICIAL_PYQ` (`OFFICIALLY_VERIFIED`):**
   Direct verbatim extract from official UPSC question booklets with verified official final answer keys. All 121 prelims questions in the primary database carry this badge.
2. **`EDUCATOR_VERIFIED`:**
   Model questions crafted by veteran UPSC faculty with verified solutions and standard rubrics.
3. **`CURATED_PRACTICE`:**
   Topical drill sets compiled from verified themes. Never presented as a 100-question or 80-question official paper.
4. **`AI_DIAGNOSTIC`:**
   Pedagogical feedback and model answers generated for self-reflection. Explicitly disclaimed as non-official algorithmic assessments.

---

## 6. Language Parity Breakdown

| Content Section | English (Total) | Hindi (Devanagari) | Completion Status |
| :--- | :---: | :---: | :---: |
| **Prelims Questions** | 121 | 41 | 33.9% (In-Progress) |
| **Prelims Options** | 484 | 164 | 33.9% (In-Progress) |
| **Prelims Explanations** | 121 | 36 | 29.8% (In-Progress) |
| **Mains Prompts** | 32 | 12 | 37.5% (In-Progress) |
| **UI Design System** | 100% | 100% | Complete Bilingual Toggle |

### Action Plan for Language Parity:
1. **Corpus PDF Dual-Column OCR:** Continue processing the dual-column Hindi/English PDF question papers from `UPSC_All_Exams_Searchable_Corpus_Starter_Kit.zip`.
2. **Standardized Glossary:** Ensure Hindi administrative vocabulary matches standard UPSC Hindi terminology (e.g., 'विधि द्वारा स्थापित प्रक्रिया', 'न्यायिक पुनर्विलोकन', 'राजकोषीय समेकन').
3. **Human Review:** Flag all machine-assisted translations as `AI_TRANSLATED` until reviewed and signed off by bilingual subject matter experts as `HUMAN_VERIFIED`.

---

## 7. Integrity Audit Sign-Off

- **Orphan Questions:** 0 detected.
- **Questions with missing options:** 0 detected.
- **Questions with invalid correct key:** 0 detected.
- **Schema-to-Database alignment:** 100% synchronized via migration `20261124000000_add_question_format_and_corpus_metadata`.
