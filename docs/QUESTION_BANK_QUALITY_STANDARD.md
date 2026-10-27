# Pravaah UPSC — Question Bank Quality Standard & Verification Norms

## 1. Purpose & Guiding Principles
The Pravaah UPSC Question Bank is built upon absolute fidelity to official examination records. We adhere to the core standard: **Zero synthetic or fabricated historical questions; rigorous separation of official answer keys from editorial explanations; full audit provenance.**

Every single record must satisfy the six core pillars:
1. **Authenticity:** Only public examination papers released by conducting bodies (UPSC, State PSCs) are ingested as historical PYQs.
2. **Completeness:** All questions must retain complete question stems, sub-statements, tables, and exact 4-option sets with original option letters (A, B, C, D).
3. **Official Key Fidelity:** The recorded official answer key must match the officially notified final answer key Series A (or documented mapped series).
4. **Editorial Demarcation:** Explanations, mnemonics, elimination techniques, and references must be strictly demarcated as Pravaah Editorial Content, never disguised as UPSC's own words.
5. **Traceable Provenance:** Every question must link to a valid `SourceDocument` with file hash, original page number, and publication metadata.
6. **Immutable Historical Audit:** Disputed, withdrawn, or dropped questions must be explicitly tagged with official notification references.

---

## 2. Ingestion & Quality Gates
Every incoming batch must progress through the 6-stage publication lifecycle:

```
[DISCOVERED] ──> [EXTRACTED] ──> [VALIDATION_REQUIRED] ──> [UNDER_REVIEW] ──> [VERIFIED] ──> [PUBLISHED]
                       │                     │
                       └──> [REJECTED]       └──> [WITHDRAWN / DROPPED]
```

### Gate 1: Extraction & Syntactic Validation
- **Stem Check:** Minimum 15 characters, unicode-safe, mathematical/scientific symbols preserved without mangled formatting.
- **Options Check:** Exactly 4 non-empty options for Prelims MCQs. Must not contain duplicate choices.
- **Series Mapping:** When extracting from multiple question paper booklets (Series B, C, D), questions must be mapped back to Series A standard numbering.

### Gate 2: Official Key Validation
- Answer key must be A, B, C, or D.
- For dropped questions: Key is recorded as `DROPPED` with scoring weight handled according to UPSC official policy (marks distributed across remaining questions or awarded equally).
- For questions with multiple valid answers: Must record all officially accepted options (e.g. `A/C`).

### Gate 3: Subject & Topic Taxonomy Classification
- Every question must map to:
  - `Exam`: (e.g., UPSC Civil Services Examination)
  - `Stage`: (e.g., Preliminary)
  - `Paper`: (e.g., General Studies Paper I or CSAT Paper II)
  - `Subject`: (e.g., Indian Polity & Governance, Modern History, Environment & Ecology, Economy, Geography, Science & Tech, Art & Culture)
  - `Topic`: Specific micro-theme from the official UPSC syllabus (e.g., Fundamental Rights, Monetary Policy, Western Ghats biodiversity).

### Gate 4: Editorial Quality & Pedagogical Explanation
Each published question must provide:
- **Core Explanation:** Why the correct option is right with statutory, constitutional, or standard textbook citations (NCERT, Laxmikanth, Ramesh Singh, etc.).
- **Option Elimination Note:** Why incorrect options are wrong.
- **Related Syllabus Theme:** Link to broad Mains themes and current affairs where applicable.

---

## 3. Disputed, Dropped, and Revised Questions Policy
UPSC periodically revises keys or drops questions after receiving representation from candidates.
1. **Never delete a dropped question:** Aspirants study past exams to understand UPSC trends, including what kind of ambiguities caused drops.
2. Tag status as `DROPPED` or `DISPUTED`.
3. Provide an objective editorial note explaining the ambiguity that led to UPSC dropping the question.

---

## 4. Duplicate Prevention & Identity Rules
To prevent duplicate questions when ingesting papers across multiple sources:
1. **Composite Unique Identity:** `(examCode, year, paperCode, questionNumber)` forms the strict primary identifier.
2. **Text Fingerprinting:** Normalized stem text (lowercased, punctuation-stripped, whitespace-collapsed) is hashed (SHA-256) to detect identical questions appearing across different exams (e.g., questions repeated between CAPF and CDS).
3. Ambiguous duplicates (>85% trigram match with differing question numbers) are flagged for human review in `exports/duplicate_candidates.csv`.
