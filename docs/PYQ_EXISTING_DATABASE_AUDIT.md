# PRAVAAH UPSC — EXISTING PYQ DATABASE & REPOSITORY AUDIT

**Audit Date:** November 22, 2026  
**Auditor:** Principal Data Architect & Senior UPSC Content Verification Lead  
**Scope:** Forensic examination of existing question inventory, database schemas, relationships, duplicates, and coverage gaps.  

---

## 1. EXECUTIVE INVENTORY SUMMARY

A complete database and code-level audit was conducted against the local Docker PostgreSQL database instance, Prisma ORM mappings, and the source archives located in `/Volumes/DevDrive/pravaah-upsc/chat`.

| Metric | Current Count | Target Production Standard | Gap / Deficit |
| :--- | :---: | :---: | :--- |
| **Total Question Records** | **1,124** | **3,500+** (1995–2024 Prelims) | -2,376 questions |
| **GS Paper 1 Questions** | **644** | **2,500+** (1995–2024: ~100 Qs/yr) | Needs 1995–2018 authentic papers |
| **GS Paper 2 (CSAT) Questions** | **480** | **1,120** (2011–2024: 80 Qs/yr) | Needs 2011–2018 authentic papers |
| **Question Options** | **4,496** | 4 per MCQ (100% complete) | Complete for existing records (4 options/Q) |
| **Verified Answer Keys** | **1,123** | 100% official UPSC answer key | 1 record missing official answer |
| **Explanations Available** | **1,124** | 100% pedagogical explanations | Complete for existing records |
| **Hindi Text Records (`questionTextHi`)** | **2** | **100% Bilingual Parity** | **Critical Deficit: 1,122 questions lack Hindi** |
| **Duplicate Synthetic Text Clusters** | **65** clusters (482 records) | 0 duplicates | Synthetic template questions repeated across 2019–2024 |

---

## 2. DISTRIBUTION BY EXAMINATION YEAR

| Examination Year | Question Count | GS Paper 1 | CSAT (GS 2) | Audit Findings & Authenticity Status |
| :---: | :---: | :---: | :---: | :--- |
| **2024** | 213 | 133 | 80 | Authentic 2024 Series A + 33 duplicate synthetic variants |
| **2023** | 182 | 102 | 80 | Authentic 2023 Series A + 2 duplicate synthetic variants |
| **2022** | 180 | 100 | 80 | Standard count; contains repeated template clones from 2023/24 |
| **2021** | 180 | 100 | 80 | Standard count; contains repeated template clones |
| **2020** | 180 | 100 | 80 | Standard count; contains repeated template clones |
| **2019** | 180 | 100 | 80 | Standard count; contains repeated template clones |
| **2018** | 2 | 2 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2017** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2016** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2015** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2014** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2013** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2012** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **2011** | 1 | 1 | 0 | **Severely Incomplete** (Needs full 100 GS1 + 80 CSAT) |
| **1995–2010** | **0** | **0** | **0** | **Missing from Database** (Present in IASBoard reference inventory) |

---

## 3. DISTRIBUTION BY SUBJECT TAXONOMY

Questions are linked to subjects via the relational join table `QuestionTopic` -> `Topic` -> `Subject`:

| Canonical Subject Domain | Associated Questions | Active Topics Linked | Primary Subtopics Covered |
| :--- | :---: | :---: | :--- |
| **Polity & Governance** | 145 | 5 | Union & State Executive, Parliament, Judiciary, Constitutional Bodies, Panchayati Raj |
| **Economy & Social Development**| 138 | 5 | Banking & Monetary Policy, Fiscal Policy & Budget, Inflation, External Sector, Agriculture |
| **Environment & Biodiversity** | 98 | 4 | National Parks & WNBR, Climate Accords (COP/UNFCCC), Pollution, Environmental Acts |
| **History & Art & Culture** | 73 | 3 | Ancient India & Vedic literature, Medieval India, Modern Freedom Movement |
| **Geography & Agriculture** | 73 | 3 | Climatology (Monsoon, ENSO), Physical Geography, River Basins & Cropping patterns |
| **Science & Technology** | 73 | 3 | Biotechnology, Space Missions (ISRO), Defense Tech & Emerging Computing |
| **CSAT: Quantitative Aptitude** | 179 | 3 | Number Systems, Percentages & Ratios, Speed-Time-Distance, Permutations |
| **CSAT: Logical Reasoning** | 181 | 3 | Syllogisms, Seating Arrangements, Coding-Decoding, Blood Relations |
| **CSAT: Reading Comprehension** | 120 | 2 | Crux identification, Assumptions & Inferences, Critical Reasoning |

---

## 4. VERIFICATION STATUS & DATA INTEGRITY FINDINGS

1. **Answer Key Provenance:**
   - `OFFICIALLY_VERIFIED`: 1,124 records (100%).
   - `UPSC_FINAL_KEY`: 1,123 questions possess valid single-choice keys (`A`, `B`, `C`, `D`). Exactly 1 record has an empty answer key relation (`missingAns = 1`).
2. **Explanations:**
   - 1,124 records have non-empty explanations in `Explanation.detailedExplanation`.
3. **Hindi Language Parity:**
   - Only **2 questions** (CSE 2024 Q85 on Attorney General and Q86 on Biosphere Reserves) contain dual `questionTextEn` and `questionTextHi` with translated options `optionTextHi`.
   - **1,122 questions** are English-only (`questionTextHi = null`). This represents the single largest content deficit for a bilingual platform.
4. **Duplicate Template Clusters:**
   - 65 unique `questionText` strings are repeated across multiple years.
   - For example:
     - *"With reference to Article 6 of the Paris Climate Agreement..."* is repeated 24 times (appearing 4 times per year across 2019 to 2024).
     - CSAT mixture problems (*"A vessel contains a mixture of milk and water..."*) are repeated 6 times across 2019 to 2024 with identical parameters.
   - **Root Cause:** In an earlier rapid seed pass (`seed_historical_questions.mjs`), a placeholder template loop generated filler questions to meet count targets. These duplicates must be pruned and replaced with authentic historical UPSC papers.

---

## 5. DATABASE SCHEMA GAPS & REQUIRED ENHANCEMENTS

1. **`subjectId` Foreign Key on `Question`:**
   - In `Question`, the column `subjectId` exists but is currently `NULL` across all records because relationships were solely established through the `QuestionTopic` M:N join.
   - **Fix:** Denormalize and backfill `Question.subjectId` directly from `Topic.subjectId` to enable high-speed subject filtering at < 15ms latency.
2. **Missing `Subtopic` Table Population:**
   - `Subtopic` table has 0 rows in the database.
   - **Fix:** Populate canonical UPSC subtopics (e.g., under "Polity" -> "Judiciary" -> Subtopic "Writs & PIL").
3. **Year Inventory Model (`ExamYear`):**
   - 448 rows exist in `ExamYear` tracking harvest status, but the client PYQ explorer does not query this model to display year pill count badges (e.g., `2024 (100)`, `2023 (100)`, `1995 (36)`).
   - **Fix:** Connect dynamic year inventory endpoint `GET /api/v1/pyqs/inventory` to return exact question counts per year and paper.
4. **Bilingual Question Translation Flag:**
   - Need an explicit `translationStatus` enum (`OFFICIAL_UPSC`, `HUMAN_REVIEWED`, `MACHINE_TRANSLATED`, `PENDING_TRANSLATION`) so students never confuse machine translations with official Hindi papers.

---

## 6. AUDIT CONCLUSION & ACTION PLAN

The existing database provides an excellent relational foundation with 1,124 active records and 100% explanation coverage. However, to match and surpass IASBoard:
1. **Deduplicate:** Cleanse the 65 synthetic template clusters.
2. **Expand Coverage (1995–2018):** Ingest authentic historical questions for Prelims GS1 and CSAT.
3. **Bilingual Ingestion:** Populate `questionTextHi`, `optionTextHi`, and `explanationHi` using authentic Hindi question papers.
4. **New Dedicated Interface:** Build `/prelims/pyqs` featuring year pill badges with question counts, dual-paper switching (GS1 / CSAT), 24-subject taxonomy dropdown, and stateful practice reveal.
