# Pravaah UPSC — Content Review, Validation & Publication Workflow

**Document Version:** 2.0 (Production Review & Quality Standard)  
**Standard Standard:** ISO 9001 / Academic Provenance Model  
**Compliance Scope:** Questions, Official Answer Keys, Editorial Explanations, Current Affairs Stories, Exam Profiles

---

## 1. Explicit Lifecycle State Machine

Every content item (Question, Answer Key, Current Affairs Story, Mains Question) moves through an explicit, auditable state machine:

```
[DISCOVERED] 
     │
     ▼
[EXTRACTED] 
     │
     ▼
[VALIDATION_REQUIRED] 
     │
     ▼
[UNDER_REVIEW] 
     │
     ├───► [VERIFIED] ───► [PUBLISHED]
     │          │                 │
     ├───► [REJECTED]             ├───► [WITHDRAWN]
     │                            │
     └───► [CORRECTED]            └───► [SUPERSEDED]
```

### State Definitions & Transition Criteria:

| State | Definition | Gatekeeper | Automated vs. Manual |
| :--- | :--- | :--- | :---: |
| **`DISCOVERED`** | Remote PDF document or government feed item identified and logged in `SourceRegistryRecord`. | Automated Crawler | Automated |
| **`EXTRACTED`** | Text parsed into stems, options (A-D), and metadata using PyMuPDF / pdfplumber. | Document Parser | Automated |
| **`VALIDATION_REQUIRED`** | Extraction completed; pending automated structural sanity checks (4 options, single key, character length >= 15). | QA Validation Engine (`scripts/validate_question_bank.py`) | Automated |
| **`UNDER_REVIEW`** | Automated checks passed; item queued for subject-matter expert editorial review. | Content Editor | Manual Review |
| **`VERIFIED`** | Answer key verified against official UPSC final key; explanation vetted against standard references (NCERT, Constitution, Gazette). | Senior Subject Analyst | Manual Sign-off |
| **`PUBLISHED`** | Active in public database, visible on `/pyqs`, `/mock-tests`, `/current-affairs`, and `/daily-quiz`. | System Administrator | Gated Admin Action |
| **`REJECTED`** | Unrecoverable parsing error, corrupt document, or unverified source; excluded from database. | Reviewer / Administrator | Manual / Auto |
| **`WITHDRAWN`** | Previously published item temporarily pulled from public view due to dispute or factual review. | Administrator | Immediate Action |
| **`SUPERSEDED`** | Official answer key amended by UPSC post-result declaration or official corrigendum. | Senior Analyst | Versioned Update |
| **`CORRECTED`** | Typographical or formatting correction made with audit log preserved. | Content Editor | Audit Logged |

---

## 2. Review Provenance & Audit Logging

No item may be marked `VERIFIED` or `PUBLISHED` without storing complete reviewer provenance:
1. **Reviewer Identity:** `reviewerId` and authenticated user role (`ADMIN` or `CONTENT_REVIEWER`).
2. **Timestamp:** UTC ISO-8601 timestamp (`verifiedAt`).
3. **Source Reference:** Canonical URL of the official UPSC answer key or government gazette document.
4. **State Transition Record:** Previous state, new state, and rationale logged in `AuditLog` table.
5. **Modification Diffs:** Any text edits preserve original raw extracted text.

---

## 3. Answer Key Separation Principles

To prevent confusion between official exam rulings and pedagogical interpretations, Pravaah strictly maintains three distinct concepts:

1. **Official UPSC Final Answer Key (`UPSC_OFFICIAL_FINAL`):**
   - Derived directly from Union Public Service Commission official gazette documents.
   - Immutable once verified.
   - If dropped by UPSC, recorded as `DROPPED` and scored according to official UPSC normalization formulas.
2. **Independently Authored Pedagogical Explanations (`INDEPENDENT_AUTHORED`):**
   - Authored by Pravaah subject experts.
   - Breaks down concept fundamentals, elimination heuristics, and NCERT citations.
3. **AI-Generated Draft Explanations (`AI_GENERATED_DRAFT`):**
   - Automatically flagged as `DRAFT` / `NEEDS_REVIEW`.
   - Never exposed to users as official UPSC explanations.
   - Must receive human editorial approval before advancing to `VERIFIED`.

---

## 4. Administrative Override & Dispute Resolution

Administrators have access to `/admin/review` and `/admin/ingestion` to:
- Review batches awaiting verification.
- Reject flawed batches with error manifests.
- Trigger instant rollbacks or withdrawal of disputed questions.
- Re-map option letters if exam series mapping discrepancies are reported.
- Export coverage and dispute manifests to CSV.
