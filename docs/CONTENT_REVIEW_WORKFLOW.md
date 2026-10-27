# Pravaah UPSC — Content Review & Editorial Quality Workflow

## 1. Quality Lifecycle States
Every question, current affairs card, and answer key follows the strict state machine:
```
[DISCOVERED] ──> [EXTRACTED] ──> [FACT_CHECK_REQUIRED] ──> [EDITOR_REVIEW] ──> [APPROVED] ──> [PUBLISHED]
                       │                     │                      │
                       └──> [REJECTED]       └──> [WITHDRAWN]       └──> [ARCHIVED]
```

### Stage Definitions:
1. **DISCOVERED:** Raw source paper or government press release detected via scheduled crawler.
2. **EXTRACTED:** Machine-parsed into stems, options, and metadata.
3. **FACT_CHECK_REQUIRED:** Factual claims, dates, and option letters cross-verified against official gazettes or answer keys.
4. **EDITOR_REVIEW:** Editorial explanation and syllabus mapping checked for pedagogy and accuracy.
5. **APPROVED:** Cleared for publication by administrator or designated content reviewer.
6. **PUBLISHED:** Active in public catalog, searchable by aspirants.

---

## 2. Editorial Rules for Explanations
- **Strict Distinction:** Official UPSC questions must NEVER be modified. Official keys must NEVER be rewritten.
- **Editorial Attribution:** Explanations and elimination techniques must carry clear editorial markers distinguishing them from official government pronouncements.
- **Source Grounding:** Statements of fact must cite standard authority (e.g. Constitution of India Articles, NCERTs, statutory acts, Economic Survey).
