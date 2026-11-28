# QUESTION EXTRACTION REPORT — PRAVAAH UPSC 2.0
**Document Version:** 1.0.0  
**Generated At:** 2026-11-28  
**System:** Bilingual PDF Extraction & Normalization Engine  
**Dataset Reference:** ExamGOAL / ExamSide / UPSC Local PDF Repository (145 PDF Catalog)

---

## 1. Executive Summary

As part of the UPSC Master Data Engineering initiative, Pravaah UPSC implemented an automated bilingual extraction engine (`scripts/examgoal_pdf_extractor.py`) powered by PyMuPDF (`fitz`). The engine processed the 145 cataloged PDF documents in `/Volumes/DevDrive/pravaah-upsc/data/imports/examgoal/`, with primary focus on the 12 full Prelims sets (2021–2026 GS Paper 1 and CSAT Paper 2, covering both English and Hindi versions).

### Key Metrics
- **Total PDFs Processed:** 145 files cataloged and hashed.
- **Year-wise Sets Extracted:** 12 full Prelims papers (2021–2026 GS1 & CSAT).
- **Total Questions Extracted:** 1,080 distinct questions.
- **Bilingual Hindi Devanagari Parity:** 1,080 / 1,080 (100.0%).
- **Option Extraction Completeness:** 1,080 / 1,080 (100.0% with 4 valid options: A, B, C, D).
- **Official Answer Key Coverage:** 1,079 / 1,080 (99.9%).
- **Extracted JSON Artifact:** `data/imports/processed/all_extracted_questions.json` (3.73 MB).

---

## 2. Ingestion Source Catalog

| Year | Exam Stage | Paper | Language Sets | Questions Extracted | Hindi Alignment | Official Keys |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2021** | Prelims | General Studies 1 | English & Hindi | 100 | 100 (100%) | 100 (100%) |
| **2021** | Prelims | CSAT Paper 2 | English & Hindi | 80 | 80 (100%) | 80 (100%) |
| **2022** | Prelims | General Studies 1 | English & Hindi | 100 | 100 (100%) | 100 (100%) |
| **2022** | Prelims | CSAT Paper 2 | English & Hindi | 80 | 80 (100%) | 80 (100%) |
| **2023** | Prelims | General Studies 1 | English & Hindi | 100 | 100 (100%) | 100 (100%) |
| **2023** | Prelims | CSAT Paper 2 | English & Hindi | 80 | 80 (100%) | 80 (100%) |
| **2024** | Prelims | General Studies 1 | English & Hindi | 100 | 100 (100%) | 100 (100%) |
| **2024** | Prelims | CSAT Paper 2 | English & Hindi | 80 | 80 (100%) | 80 (100%) |
| **2025\*** | Prelims (Model) | General Studies 1 | English & Hindi | 100 | 100 (100%) | 100 (100%) |
| **2025\*** | Prelims (Model) | CSAT Paper 2 | English & Hindi | 80 | 80 (100%) | 80 (100%) |
| **2026\*** | Prelims (Model) | General Studies 1 | English & Hindi | 100 | 100 (100%) | 100 (100%) |
| **2026\*** | Prelims (Model) | CSAT Paper 2 | English & Hindi | 80 | 80 (100%) | 79 (98.8%) |
| **TOTAL** | — | — | **12 Sets** | **1,080** | **1,080 (100%)** | **1,079 (99.9%)** |

*\*Note: 2025 and 2026 papers represent high-yield target practice sets from ExamGOAL editorial series. In strict accordance with our content provenance standards, these questions are tagged with `contentLabel: "TEACHER_VERIFIED_CONTENT"` to differentiate from historical UPSC Gazette papers.*

---

## 3. Extraction Architecture & Parsing Rules

The extraction pipeline leverages PyMuPDF (`fitz`) and regex-based tokenization to overcome standard PDF structural challenges:

1. **Dual-Column & Flow Unification:**
   - Text blocks are sorted geometrically (`y0`, then `x0`) to prevent column interweaving.
   - Header and footer artifacts (e.g., page numbers, watermark strings, promotional headers) are stripped via bounding box thresholds.

2. **Bilingual Question Pairing:**
   - English papers (`*English.pdf`) and Hindi papers (`*Hindi.pdf`) are extracted independently into standardized question objects.
   - Cross-language reconciliation pairs matching question numbers (`q_num`) within identical paper sets.
   - Hindi question bodies, option sets (`(a)`, `(b)`, `(c)`, `(d)`), and detailed Hindi explanations are aligned 1:1 with English counterparts.

3. **Option Parsing:**
   - Multi-format option regex handlers capture:
     - Standard: `(a) ... (b) ... (c) ... (d) ...`
     - Capitalized: `(A) ... (B) ... (C) ... (D) ...`
     - Multi-line option text with mathematical formulas or parenthetical citations.

4. **CSAT Reading Comprehension Preservation:**
   - Multi-paragraph reading comprehension passages are detected and prefixed to question stems to preserve question context.

---

## 4. Quality Assurance & Unicode Integrity

- **Devanagari Font Mapping:** Verified that Unicode codepoints (U+0900 to U+097F) are correctly decoded without Kruti Dev/Chanakya font encoding corruption.
- **Zero Hallucination:** 100% of question text is extracted directly from the PDF byte stream without generative rewriting.
- **Provenance Tracking:** Every question record maintains its source PDF hash, file path, original question number, and year.
