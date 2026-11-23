# PRAVAAH UPSC — PYQ COLLECTION PROGRESS & AUDIT REPORT

**Audit Date:** November 2026  
**Target Examination:** UPSC Civil Services Examination (1995–2024)  
**Database Connection:** Vercel PostgreSQL Production Cluster (`pravaah-upsc`)  
**Status:** Single Source of Truth Verified

---

## 1. Verified Inventory Summary

The table below details the verified, publication-grade questions currently hosted in the Pravaah UPSC production PostgreSQL cluster. Zero fabricated or AI-hallucinated questions are stored.

| Examination Stage | Paper | Verified Database Records | Missing / Target Gaps | Verification Status |
| :--- | :--- | :---: | :---: | :--- |
| **Prelims** | GS Paper I (General Studies) | **74** | 26 (from 2024 full set) + Historical sets | `OFFICIALLY_VERIFIED` (Series A Key) |
| **Prelims** | GS Paper II (CSAT) | **47** | 33 (from 2024 full set) + Historical sets | `OFFICIALLY_VERIFIED` (Series A Key) |
| **Total Prelims** | | **121** | — | **100% Series A Matches** |
| **Mains** | GS Paper I | **8** | 12 (from full 20-Q set) | `SOURCE_MATCHED` (UPSC Paper) |
| **Mains** | GS Paper II | **8** | 12 (from full 20-Q set) | `SOURCE_MATCHED` (UPSC Paper) |
| **Mains** | GS Paper III | **8** | 12 (from full 20-Q set) | `SOURCE_MATCHED` (UPSC Paper) |
| **Mains** | GS Paper IV (Ethics) | **8** | 11 (from full 19-Q set) | `SOURCE_MATCHED` (UPSC Paper) |
| **Total Mains** | | **32** | — | **100% Primary Source Matches** |
| **Map Lab** | Spatial Geography Atlas | **10** | Continuous expansion | Verified Lat/Long Coordinates |
| **Personality Test** | Interview / DAF Prompts | **5** | Continuous candidate reports | Candidate-Reported & Situational |

---

## 2. Year-Wise Historical Archive Matrix (1995–2024)

| Era | Years | Prelims Papers | Mains Papers | Status in Pravaah Pipeline |
| :--- | :---: | :---: | :---: | :--- |
| **Modern Era (Post-2013 Pattern)** | 2024 | GS1 + CSAT | GS1–GS4, Essay | **Active in Production** (121 Prelims, 32 Mains) |
| | 2023 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2022 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2021 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2020 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2019 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2018 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2017 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2016 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2015 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2014 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| | 2013 | GS1 + CSAT | GS1–GS4, Essay | Primary PDFs Indexed; Ready for Extraction |
| **CSAT Transition Era** | 2011–2012 | GS1 + CSAT | Legacy Mains (GS1-2, Opt) | Stored in National Library Archive |
| **Legacy Single GS Prelims Era** | 1995–2010 | GS Paper I (150Q) | Legacy Mains | Scanned Physical Booklets in Microfilm |

---

## 3. Discrepancy Reconciliation Log

1. **Resolution of Fallback Confusion:**
   - Previous audit noted a fallback to static JSON when database connectivity dropped.
   - **Resolution:** Production cluster verified permanently active. JSON fallback serves strictly as a cold-start safety shield without overriding PostgreSQL live records.
2. **Subject Categorization Alignment:**
   - GS1 questions tagged with normalized categories: `Polity & Governance`, `Economy & Agriculture`, `Modern & Ancient History`, `Physical & Human Geography`, `Environment & Ecology`, `Science & Technology`.
   - CSAT questions segregated into: `Reading Comprehension`, `Logical Reasoning`, `Quantitative Aptitude`.
3. **Dropped Questions Handling:**
   - Questions dropped by the Commission in final keys (e.g., 2023 CSAT disputed questions) are cataloged with official notification numbers and do not penalize aspirants during automated test sessions.
