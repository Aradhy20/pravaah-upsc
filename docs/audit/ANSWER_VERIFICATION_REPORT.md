# PRAVAAH UPSC – ANSWER KEY PROVENANCE & VERIFICATION AUDIT
**Audit Executed:** November 21, 2026  
**Target Entity:** `QuestionAnswer` (1,123 Records) & `AnswerKeyVersion`  
**Primary Standards:** Official UPSC Final Answer Keys published by the Union Public Service Commission  
**Auditor:** Principal Software Engineer & Senior Academic Content Auditor  

---

## 1. ANSWER KEY PROVENANCE DISTRIBUTION

A key differentiator for a serious UPSC preparation platform is providing verified official final answer keys rather than coaching institute estimates.

### Provenance Audit Breakdown
| Answer Key Type (`answerKeyType`) | Record Count | Percentage | Provenance Level |
| :--- | :---: | :---: | :--- |
| **`UPSC_FINAL_KEY`** | **1,123** | **99.91%** | **Primary Official (Highest)** |
| **`UPSC_PROVISIONAL_KEY`** | 0 | 0.00% | Secondary |
| **`PROVIDER_DERIVED`** | 0 | 0.00% | Secondary |
| **`FACULTY_DERIVED`** | 0 | 0.00% | Coaching Estimate |
| **`UNVERIFIED`** | 0 | 0.00% | Unverified |
| **`NO_KEY_FOUND` (Missing)** | **1** | **0.09%** | Missing Key |
| **TOTAL** | **1,124** | **100.00%** | — |

### Verification Status (`verificationStatus`)
- **`OFFICIALLY_VERIFIED`**: 1,123 records (99.91%)
- **`PENDING_VERIFICATION`**: 1 record (0.09%)

---

## 2. DISPUTED & DROPPED QUESTIONS AUDIT

In every UPSC Prelims examination, the Commission typically drops 1–3 ambiguous questions or accepts multiple options (e.g. "A or C") following candidate representations.

### Audit Findings:
1. **Dropped Questions Representation:**
   - In the current database, **0 questions are marked as `answerOption: "DROPPED"`** or `answerType: "DROPPED"`.
   - All 1,123 answered records have a single letter answer (`A`, `B`, `C`, or `D`).
2. **Ambiguous Questions Representation:**
   - No questions currently utilize multi-key allowances (`A_OR_C`).
3. **Evaluation Risk:**
   - In years like 2023 and 2022 where UPSC officially dropped questions in GS Paper 1 and CSAT (e.g., the Sports questions dispute or the number theory question in CSAT 2023), the platform does not reflect the dropped status.
   - If students take full-length mock tests for these years, scoring algorithms must account for dropped questions (e.g. re-allocating marks or neutralizing negative marking).

---

## 3. ANSWER KEY VERSIONING AUDIT

The schema includes a dedicated table `AnswerKeyVersion` designed to store:
- `provisionalKey`: Initial unofficial or provisional key.
- `finalOfficialKey`: Official key released by UPSC post-results.
- `disputeNotes`: Academic rationale explaining why the provisional key changed.

### Audit Finding:
- `AnswerKeyVersion` table contains **0 records**.
- **Explanation:** During initial database seeding, answers were inserted directly into the active `QuestionAnswer` table with `answerKeyType: "UPSC_FINAL_KEY"` without retaining intermediate provisional revisions in `AnswerKeyVersion`.

---

## 4. PEDAGOGICAL EXPLANATION QUALITY

Every question in the database was evaluated for explanation completeness:
- **Total Explanations:** 1,124 records in `Explanation` table.
- **Coverage:** 100% of questions have an associated explanation.
- **Average Explanation Length:** 412 characters.
- **Formatting:** Formatted with Markdown lists, statutory citations, and conceptual reasoning.

---

## 5. AUDIT RECOMMENDATION

1. **Populate Dropped Question Flags:** Review official UPSC final answer key notices for 2019–2024 and mark dropped questions with `answerOption: "DROPPED"` and `marks: 0.0`.
2. **Backfill the Missing Answer:** Insert the official final key for the single question currently lacking a `QuestionAnswer` row.
