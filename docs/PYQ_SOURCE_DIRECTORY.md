# MASTER PYQ SOURCE DIRECTORY — PRAVAAH UPSC

**Platform:** Pravaah UPSC  
**Document:** Official Examination Source Registry & Portal Directory  
**Authority Reference:** `Pravaah_UPSC_Master_PYQ_Bank_Blueprint.pdf`  
**Status:** ACTIVE & MONITORED  

---

## 1. Official UPSC Question Paper Portals

The Union Public Service Commission (UPSC) publishes authentic examination papers in PDF format across dedicated landing pages and archived directories. Pravaah UPSC treats these primary government URLs as the sole controlling references for question wording, sequence, and official Series A keys.

| Official Resource | Canonical URL | Coverage Scope & Function |
| :--- | :--- | :--- |
| **UPSC Live Question Papers Directory** | `https://www.upsc.gov.in/examinations/previous-question-papers` | Primary portal for current and recent examination years (2020–2024). Contains Prelims GS1, CSAT, Mains GS1–GS4, Essay, and Optional papers. |
| **UPSC CMS Question Papers Archive** | `https://cms.upsc.gov.in/archived-exam-documents/question-papers/` | Deep archive containing historical question PDFs spanning 1995–2019 across Civil Services, Forest Service, and Engineering Services. |
| **UPSC Previous Exam Details & Cut-offs** | `https://www.upsc.gov.in/previous-exam-details/` | Public repository for official answer keys, minimum qualifying cut-off marks, candidate service allocations, and exam notices. |
| **UPSC Examination Scheme & FAQs** | `https://cms.upsc.gov.in/about-us/divisions/examination/` | Authoritative definition of exam rules, 33% CSAT qualifying thresholds, negative marking rules, and paper durations. |

---

## 2. Secondary & Explanatory Benchmarking Sources

When decomposing raw question PDFs into structured database records with pedagogical explanations, secondary question-bank repositories are utilized solely for explanatory commentary and never as a substitute for official keys.

| Source Name | URL Reference | Role in Data Pipeline | Caveat / Guardrail |
| :--- | :--- | :--- | :--- |
| **NextGenPSC 2024 Prelims Archive** | `https://www.nextgenpsc.com/prelims-pyq/year/2024` | Secondary reference for option transcription and initial explanatory drafting. | Must be independently matched against UPSC official Series A PDF before receiving `OFFICIALLY_VERIFIED` status. |
| **PIB / Supreme Court Gazette** | `https://main.sci.gov.in/`, `https://pib.gov.in/` | Primary legal and governmental source citations for constitutional and regulatory questions. | Used in `Explanation.sourceCitation` and `CurrentAffairsStory.sourceUrl`. |

---

## 3. Directory Integrity & Access Rules

1. **Original PDF Preservation:** Every downloaded UPSC question paper PDF is preserved in untouched original form under `data/official_upsc_pdfs/{year}/{paper}/` with SHA-256 hash validation.
2. **Booklet Series Control:** UPSC administers Preliminary examinations across four randomized booklet series (Series A, B, C, D). Pravaah UPSC standardizes its question numbers strictly according to **Series A**.
3. **No Fabricated Data:** If a paper or answer key for a historical year is unavailable from official archives, it is recorded as missing in `docs/PYQ_COLLECTION_PROGRESS.md` rather than synthesized.
