# Content Ingestion & Verification Plan
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Focus:** High-Fidelity Provenance, Answer-Key Integrity, and Pedagogical Verification  

---

## 1. Principles of Content Provenance & Integrity

1. **Official UPSC Authority:** All examination questions and original answer keys must originate from official notifications published on `upsc.gov.in`.
2. **Never Auto-Verify on Extraction:** A question extracted from a PDF or OCR pipeline, regardless of confidence score, is initially assigned status `DRAFT`. It can NEVER be marked as `VERIFIED` or `PUBLISHED` without explicit human editorial sign-off.
3. **Multi-Series Alignment:** UPSC papers are printed in four series (A, B, C, D) with jumbled question orders. The platform standardizes on **Series A** as canonical while retaining original paper metadata.

---

## 2. Ingestion Pipeline Stages

```
   Official UPSC Source (PDF)
             │
             ▼
   [Stage 1: Source Registration & SHA256 Hash]
             │
             ▼
   [Stage 2: PDF Parsing / Text Segmentation]
             │
             ▼
   [Stage 3: Option & Statement Extraction Regex]
             │
             ▼
   [Stage 4: Automated Validation & Deduplication]
             │
   (Fails validation) ──► Rejection Report
             │
   (Passes validation)
             ▼
   Database Status: [DRAFT]
             │
             ▼
   Pedagogical Enrichment (Subject/Topic Tagging & Explanation Writing)
             │
             ▼
   Database Status: [NEEDS_REVIEW]
             │
             ▼
   Human Expert Review (Answer Key Verification against UPSC Key)
             │
             ▼
   Database Status: [VERIFIED]
             │
             ▼
   Editorial Sign-off ──► Database Status: [PUBLISHED] (Publicly Visible)
```

---

## 3. Extraction & Segmentation Specification

### 3.1 Regex Rules for UPSC Question Paper Segmentation
UPSC Prelims questions typically follow structured conventions:
- **Question Numbering:** Starts with `1.`, `2.`, `3.` or `Q.1`, `Q.2` at the beginning of a line.
- **Statement Lists:** `1.`, `2.`, `3.` followed by text, ending with:
  *"Which of the statements given above is/are correct?"* or *"How many of the pairs given above are correctly matched?"*
- **Options Block:**
  - `(a)` [Option Text]
  - `(b)` [Option Text]
  - `(c)` [Option Text]
  - `(d)` [Option Text]

### 3.2 Duplicate Detection Strategy
- Normalize text by converting to lowercase, stripping punctuation, extra whitespace, and leading question indices.
- Compute MD5/SHA256 fingerprint of the normalized stem.
- Cross-reference with existing questions in the same `year` and `paperId` to flag duplicate imports from differing test series.

---

## 4. Question Lifecycle Statuses

| Status | Definition | Visibility |
|---|---|---|
| `DRAFT` | Raw question parsed from PDF/OCR; may contain formatting anomalies or incomplete options. | Admin Only |
| `NEEDS_REVIEW` | Options extracted, initial subject/topic tagged, preliminary explanation drafted. Awaiting editorial audit. | Admin Only |
| `VERIFIED` | Subject Matter Specialist verified statement accuracy, official UPSC answer key matched, explanation reviewed. | Admin Only |
| `PUBLISHED` | Formally approved and released into student search, mock tests, and explorer. | Public |
| `ARCHIVED` | Deprecated, superseded by revised UPSC key, or duplicate entry. Retained for historical audit. | Admin Only |

---

## 5. Pedagogical Explanation Standard

Every published question must provide a structured, three-part explanation:
1. **Core Takeaway:** Clear, concise statement explaining the direct reason why the official answer key is correct.
2. **Statement-by-Statement Breakdown:**
   - *Why Statement 1 is Correct/Incorrect:* Exact factual or constitutional citation.
   - *Why Statement 2 is Correct/Incorrect:* Exact factual or historical context.
3. **Elimination & Exam Technique:** Strategic insights on how an aspirant could deduce the correct option under timed conditions.
4. **Primary Reference Citation:** Standard book or official report (e.g., *NCERT Class XI Indian Constitution at Work*, *Economic Survey 2023-24*, *CCRT Art and Culture*).

---

## 6. Coverage & Quality Audit Reporting

The admin suite generates real-time coverage reports (`/admin/coverage`):
- Total questions published per year (target: 100/100 for GS1, 80/80 for CSAT).
- Breakdown of questions by status (`DRAFT`, `NEEDS_REVIEW`, `VERIFIED`, `PUBLISHED`).
- Coverage percentage by syllabus topic (e.g., "Polity: 100% verified, Environment: 92% verified").
- Discrepancy logs: Any questions where coaching answer keys differed from the final official UPSC key.
