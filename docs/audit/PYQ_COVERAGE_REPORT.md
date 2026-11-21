# PRAVAAH UPSC – HISTORICAL PYQ COVERAGE AUDIT REPORT
**Audit Executed:** November 21, 2026  
**Target Scope:** UPSC Historical Question Papers (1995–2026)  
**Database Table Evaluated:** `Question`, `MainsQuestion`, `ExamYear`, `Paper`, `Exam`  
**Auditor:** Principal Software Engineer & Senior Data Architect  

---

## 1. HISTORICAL COVERAGE MATRIX (1995–2026)

The platform aims to provide comprehensive coverage of UPSC examinations from 1995 to 2026. The audit evaluated actual database records against the target historical timeline.

### 1.1 Civil Services Examination (CSE) Summary
| Examination Stage & Paper | Historical Target | Questions in DB | Distinct Questions | Coverage Status |
| :--- | :--- | :--- | :--- | :--- |
| **CSE Prelims: GS Paper 1** | 1995–2024 (30 years) | 644 records | 56 unique questions | **Partial (2011–2024; High Duplication)** |
| **CSE Prelims: GS Paper 2 (CSAT)** | 2011–2024 (14 years) | 480 records | 35 unique questions | **Partial (2019–2024; High Duplication)** |
| **CSE Mains: GS Paper 1** | 2013–2024 (12 years) | 20 questions | 20 unique questions | **Curated High-Yield Sample** |
| **CSE Mains: GS Paper 2** | 2013–2024 (12 years) | 20 questions | 20 unique questions | **Curated High-Yield Sample** |
| **CSE Mains: GS Paper 3** | 2013–2024 (12 years) | 20 questions | 20 unique questions | **Curated High-Yield Sample** |
| **CSE Mains: GS Paper 4 (Ethics)**| 2013–2024 (12 years) | 20 questions | 20 unique questions | **Curated High-Yield Sample** |
| **CSE Mains: Essay** | 1995–2024 (30 years) | 0 questions | 0 questions | **Missing in DB** |
| **CSE Mains: Optional Subjects** | All optionals | 0 questions | 0 questions | **Missing in DB** |
| **CSE Mains: Qualifying Language**| Hindi / English | 0 questions | 0 questions | **Missing in DB** |

---

## 2. ANNUAL PRELIMS RECORD BREAKDOWN

The table below details the exact record count per year in the `Question` table for CSE Prelims:

| Exam Year | GS Paper 1 (Prelims) | GS Paper 2 (CSAT) | Total MCQs in DB | Authentic Real Questions | Duplicate Clones |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **2024** | 133 | 80 | **213** | 35 | 178 |
| **2023** | 102 | 80 | **182** | 35 | 147 |
| **2022** | 100 | 80 | **180** | 35 | 145 |
| **2021** | 100 | 80 | **180** | 35 | 145 |
| **2020** | 100 | 80 | **180** | 35 | 145 |
| **2019** | 100 | 80 | **180** | 35 | 145 |
| **2018** | 2 | 0 | **2** | 2 | 0 |
| **2017** | 1 | 0 | **1** | 1 | 0 |
| **2016** | 1 | 0 | **1** | 1 | 0 |
| **2015** | 1 | 0 | **1** | 1 | 0 |
| **2014** | 1 | 0 | **1** | 1 | 0 |
| **2013** | 1 | 0 | **1** | 1 | 0 |
| **2012** | 1 | 0 | **1** | 1 | 0 |
| **2011** | 1 | 0 | **1** | 1 | 0 |
| **1995–2010** | 0 | N/A | **0** | 0 | 0 |
| **TOTAL** | **644** | **480** | **1,124** | **91** | **1,033** |

### Key Observations:
1. **The 100 & 80 Illusion:** For years 2019 to 2022, GS1 has exactly 100 rows and GS2 has exactly 80 rows, giving the impression of complete papers. However, inspecting the question text reveals that the exact same 35 questions are repeated across each of these years with synthetic question numbers (e.g., question 9052, 9536).
2. **Missing Pre-2011 Prelims:** Years 1995 to 2010 have 0 questions in the database.
3. **CSAT Introduction:** CSAT was introduced by UPSC in 2011. In the database, CSAT records only exist for 2019–2024 (and are cloned copies).

---

## 3. NON-CSE EXAMINATIONS COVERAGE CENSUS

The platform database defines 14 exam families in the `Exam` and `ExamYear` tables. The audit verified whether actual questions exist for these exams:

| Exam Family Code | Examination Name | Cataloged Years | Download Status | Questions in DB |
| :--- | :--- | :---: | :---: | :---: |
| **CSE** | Civil Services Examination | 32 (1995–2026) | `NOT_HARVESTED` (Tracked) | **1,124 MCQs / 80 Mains** |
| **IFOS** | Indian Forest Service | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **CDS** | Combined Defence Services | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **NDA** | National Defence Academy | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **CAPF** | Central Armed Police Forces (AC) | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **CMS** | Combined Medical Services | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **ESE** | Engineering Services Exam (IES) | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **GEOSCIENTIST** | Combined Geo-Scientist | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **IES** | Indian Economic Service | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **ISS** | Indian Statistical Service | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **CISF_LDCE** | CISF Assistant Commandant | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **CSO_LDCE** | Section Officers Grade B | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **STENO_LDCE** | Stenographers Grade B | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **EPFO** | EPFO EO/AO and APFC | 32 (1995–2026) | `NOT_HARVESTED` | **0 questions** |
| **TOTAL** | **14 Exam Families** | **448 Catalog Rows** | **All NOT_HARVESTED** | **1,204 Total Questions** |

---

## 4. AVAILABILITY TRUTH TABLE (DIGITAL REALITY)

UPSC does not publish all historical papers in digitally accessible format. The audit established this digital truth table:

1. **UPSC CSE Prelims (2014–2024):** Fully digitally available with official answer keys on `upsc.gov.in`. (High confidence harvesting feasible).
2. **UPSC CSE Prelims (2011–2013):** Available in digital archives, but official final keys require manual archival OCR.
3. **UPSC CSE Prelims (1995–2010):** Old pattern (Optional subject in Prelims prior to 2011). Not hosted on modern UPSC portals; available only in scanned paper archives from library repositories.
4. **Other UPSC Exams (CDS, NDA, CAPF 2018–2024):** Fully available on official portal; ready for harvest pipeline execution.

---

## 5. RECOMMENDATIONS & ACTION GATES

1. **Stop Marketing Full 1995–2026 Coverage:** Update landing page copy to state: *"Comprehensive Coverage of Modern Pattern (2011–2024) with expanding historical archives"*.
2. **Run Real Harvest Pipeline for 2014–2024:** Ingest all genuine 100 GS1 and 80 CSAT questions per year from official UPSC source PDFs to replace cloned records.
