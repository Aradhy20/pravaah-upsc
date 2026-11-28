# PRAVAAH UPSC — DATA QUALITY, INTEGRITY & DEDUPLICATION REPORT
**Audit Timestamp:** 2026-11-28T10:37:12.509Z  
**Quality Assurance Lead:** Senior Data Quality Engineer & PostgreSQL Architect  
**Database Engine:** PostgreSQL 17 via Prisma ORM  
**Target System:** Pravaah UPSC (https://pravaah-upsc.vercel.app/)  
**Standard:** Zero Hallucination, Traceable Provenance & Academic Soundness  

---

## 1. Executive Quality Scorecard

| Quality Dimension | Target Standard | Measured Reality | Status |
| :--- | :---: | :---: | :---: |
| **Published Series A Baseline** | 121 (1995–2024) | **121** | 🟢 100% PASS |
| **Option Completeness (4 Options/Q)** | 100.0% (484 / 484) | **100.0% (484 / 484)** | 🟢 100% PASS |
| **Single Correct Option Enforced** | 100.0% (121 / 121) | **100.0% (121 / 121)** | 🟢 100% PASS |
| **Official AnswerKeyVersion Linage** | 100.0% (121 / 121) | **100.0% (121 / 121)** | 🟢 100% PASS |
| **Pedagogical Explanation Presence** | 100.0% (121 / 121) | **100.0% (121 / 121)** | 🟢 100% PASS |
| **Canonical Syllabus Mapping** | 100.0% (121 / 121) | **100.0% (121 / 121)** | 🟢 100% PASS |
| **Unmapped Questions Count** | 0 | **0** | 🟢 ZERO DEFECTS |
| **Exact Unintended Duplicates** | 0 | **0** | 🟢 ZERO DUPLICATES |
| **Near-Duplicate Longitudinal Themes** | Monitored | **152** | ℹ️ REVIEWED |
| **Active Staging Corpus** | High-Yield Verified | **2052 records** | 🟢 STAGED |
| **Mains Subjective Corpus** | GS1–GS4 & Essay | **32 questions** | 🟢 CURATED |
| **Interview Personality Test Bank** | Situational & DAF | **10 prompts** | 🟢 CURATED |

---

## 2. Deduplication Engine Methodology

The deduplication engine implements a dual-layer detection pipeline:

1. **Deterministic Exact Hash (SHA-256):**
   - Normalizes whitespace, strips punctuation, and lowercases text.
   - Computes SHA-256 fingerprint: hash = SHA256(normalize(questionText)).
   - Found: **0 exact duplicates** in the published question bank.

2. **Longitudinal Near-Duplicate Jaccard Coefficient:**
   - Compares token sets across questions spanning 1995 to 2024 with a similarity threshold of $J \ge 0.85$.
   - Found: **152 recurring thematic prompts** (e.g. Directive Principles, Monetary Policy, Basic Structure doctrine).
   - Review conclusion: These are authentic, independent questions asked in different examination years by the UPSC. They are legitimately retained to provide historical trend analysis for students.

---

## 3. Bilingual Parity & Translation Integrity

| Corpus Layer | Total Records | With Authentic Hindi | Translation Status Policy |
| :--- | :---: | :---: | :--- |
| **Published Questions** | 121 | **41** (33.9%) | **Zero Machine Hallucination:** 41 questions have verified official Hindi text; 80 questions are explicitly marked `TRANSLATION_MISSING` to prevent unauthorized AI translation masquerading as official UPSC phrasing. |
| **Active Staging Records** | 2052 | **0** | Staged records undergo bilingual OCR verification before promotion. |
| **Mains Subjective Bank** | 32 | **32** (100.0%) | 100% of Mains descriptive questions feature verified bilingual English & Hindi prompts. |
| **Interview Prompts** | 10 | **10** (100.0%) | 100% of interview prompts include bilingual contextualization. |

---

## 4. Associated Audit CSV Artifacts

The following CSV audit exports were generated and synchronized to both the project root and `docs/` directory:

1. **`DUPLICATE_REVIEW.csv`:** Full ledger of exact and near-duplicate comparisons, similarity coefficients, and editorial resolution actions.
2. **`UNMAPPED_QUESTIONS.csv`:** Register of questions missing any mandatory metadata attribute. Currently registers **0 unmapped questions**.
3. **`FAILED_DOCUMENTS.csv`:** Register of source URLs that returned HTTP 403 or 404 during network health checks, providing remediation recommendations.

---
*End of Data Quality Report — Pravaah UPSC Master Data Engine.*
