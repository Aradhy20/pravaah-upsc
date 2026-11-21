# PRAVAAH UPSC – DUPLICATE DETECTION & DATA CORRUPTION AUDIT
**Audit Executed:** November 21, 2026  
**Audited Target:** `Question` Table (1,124 Records)  
**Algorithm:** Normalized String Hashing & Levenshtein Distance Matrix  
**Auditor:** Principal Software Engineer & Senior Data Quality Engineer  

---

## 1. EXECUTIVE SUMMARY: THE DUPLICATION ISSUE

A rigorous deduplication audit was conducted on all 1,124 records in the `Question` table using case-insensitive normalization, whitespace collapsing, and punctuation stripping.

### Key Deduplication Findings
| Metric | Count | Percentage | Severity |
| :--- | :---: | :---: | :---: |
| **Total Question Records** | 1,124 | 100.0% | Baseline |
| **Unique Question Texts** | **91** | **8.1%** | **CRITICAL DEFICIT** |
| **Duplicate Question Records** | **1,033** | **91.9%** | **CRITICAL DEFICIT** |
| **Identified Duplicate Clusters** | **65 clusters** | — | High Redundancy |
| **Duplicate Question Numbers (within same paper/year)** | **0** | 0.0% | Constraint Enforced |
| **Corrupted / Truncated Questions** | **30** | 2.7% | Data Corruption |

---

## 2. ROOT CAUSE ANALYSIS: HOW THE DUPLICATES OCCURRED

Inspection of project commit history and database seed files (`scripts/seed_rich_content.mjs` and `scripts/seed_historical_questions.mjs`) revealed the mechanism that generated these duplicates:

1. **Volume Simulation in Seed Routines:**
   Previous seeding scripts created mock historical depth by defining a pool of 35 high-quality questions and looping over years `[2019, 2020, 2021, 2022, 2023, 2024]`.
2. **Synthetic Question Numbering:**
   To satisfy the PostgreSQL unique constraint `@@unique([paperId, year, questionNumber])`, the scripts assigned synthetic random/offset question numbers (e.g., `questionNumber: 9052`, `9536`, `9719`) or generated multiple instances within the same paper under different question numbers.
3. **Result:**
   A student taking a mock test or filtering by 2020, 2021, or 2022 encounters the identical questions repeatedly, leading to loss of trust and simulated scores rather than genuine diagnostic value.

---

## 3. TOP DUPLICATE CLUSTERS

The audit identified 65 duplicate clusters. The table below lists the top most duplicated questions:

| Cluster Sample Snippet | Duplication Count | Repeated Across Years | Subject Area |
| :--- | :---: | :--- | :--- |
| *"Five persons P, Q, R, S, and T are seated in a straight row facing North. P is second to the left of R..."* | **180 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS2) | CSAT Reasoning |
| *"With reference to Indian history"* (Corrupted truncation) | **30 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | History (Misaligned) |
| *"With reference to Non-Performing Assets (NPAs) and IBC 2016, consider the following statements..."* | **30 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Indian Economy |
| *"With reference to Pradhan Mantri Jan Dhan Yojana (PMJDY), consider the following statements..."* | **30 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Government Schemes |
| *"With reference to Statutory Liquidity Ratio (SLR) and CRR, consider the following statements..."* | **30 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Banking / Monetary Policy |
| *"With reference to Schedules of the Constitution of India, consider the following statements..."* | **29 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Indian Polity |
| *"With reference to Writ of Quo-Warranto, consider the following statements..."* | **28 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Indian Constitution |
| *"With reference to Ashokan Rock Edicts and Dhamma Lipi, consider the following statements..."* | **28 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Ancient Indian History |
| *"With reference to Gross Value Added (GVA) at basic prices, consider the following statements..."* | **24 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Macroeconomics |
| *"With reference to Ambient Air Quality Standards & SAFAR, consider the following statements..."* | **24 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Environment & Ecology |
| *"With reference to Ramsar Wetlands of International Importance, consider the following statements..."* | **24 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Biodiversity & Wetlands |
| *"With reference to Bio-magnification and Bio-accumulation, consider the following statements..."* | **24 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Environmental Biology |
| *"With reference to Article 6 of the Paris Climate Agreement, consider the following statements..."* | **24 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | International Treaties |
| *"With reference to Quantum Key Distribution (QKD) satellite, consider the following statements..."* | **24 times** | 2019, 2020, 2021, 2022, 2023, 2024 (GS1) | Science & Technology |

---

## 4. EXTRACTION CORRUPTION: THE 30 MISALIGNED QUESTIONS

During the audit, a specific regex extraction defect was discovered across 30 questions.

### Defect Breakdown
- **Source:** Web extraction of 1905 history question.
- **Stored in PostgreSQL:**
  - `questionText`: `"With reference to Indian history"`
  - `Option A`: `"who founded the Servants of India Society?"`
  - `Option B`: `"Gopal Krishna Gokhale"`
  - `Option C`: `"Bal Gangadhar Tilak"`
  - `Option D`: `"Lala Lajpat Rai"`
  - `difficulty`: `"Founded in 1905 by Gopal Krishna Gokhale in Pune."`
- **What Happened:**
  The parser encountered the prompt `"With reference to Indian history, who founded the Servants of India Society?"`. It split on a comma or question phrase, erroneously assigning the trailing clause into `Option A` and shifting the actual options and explanation into the `difficulty` metadata column.

---

## 5. DEDUPLICATION & REPAIR ALGORITHM

To resolve this issue without disrupting existing user history:
1. **Identify Canonical Record:** For each of the 65 clusters, select the record with the earliest authentic year or lowest question number as `canonical_id`.
2. **Re-link Foreign Key References:**
   - Re-map any `UserAttempt`, `UserResponse`, `Bookmark`, and `UserNote` rows pointing to duplicate IDs to the `canonical_id`.
3. **Purge Clones:** Delete the 1,033 duplicate rows using a cascading transaction.
4. **Repair Corrupted Texts:** Run a dedicated update on the 30 misaligned history questions to reconstitute the complete prompt.
5. **Harvest Real Replacements:** Trigger the official harvest pipeline to ingest genuine 100 questions per year from UPSC PDFs.
