# PRAVAAH UPSC — EXTERNAL PYQ DATABASE PRE-INGESTION AUDIT
**Document Reference:** `DOCS-EXT-PYQ-AUDIT-001`  
**Execution Timestamp:** 2026-11-22T00:44:00+05:30  
**Audit Scope:** PostgreSQL Master Database Baseline before ExamGOAL, ExamSIDE & Human Peritus Ingestion  
**Database Status:** Production Database Connected & Verified (Zero Clones, Zero Dropped Records)

---

## 1. DATABASE CONNECTION & ENVIRONMENT

- **Database Engine:** PostgreSQL 17 (Docker containerized instance: `pravaah-postgres`)
- **ORM / Schema Manager:** Prisma 5.22.0
- **Connection Variable:** `DATABASE_URL` configured in `.env`
- **Integrity Rule:** Strict append-only and idempotent updates. Never reset, truncate, or overwrite verified records.

---

## 2. EXISTING QUESTION INVENTORY BREAKDOWN

### Summary Metrics:
- **Total Existing Questions:** `120`
- **Total Question Options:** `480` (100% adherence: exactly 4 options per question)
- **Total Answer Records:** `120` (100% adherence: every question has an authoritative key)
- **Duplicate Key Collisions:** `0` (Zero duplicates across composite `(paperId, year, questionNumber)`)
- **Missing Option Records:** `0`
- **Missing Answer Records:** `0`

### Paper Distribution:
| Paper Code | Paper Title | Question Count | Marking Scheme | Status |
|---|---|---|---|---|
| **GS1** | General Studies Paper I | `73` | +2.00 / -0.666 | 100% Verified |
| **GS2** | General Studies Paper II (CSAT) | `47` | +2.50 / -0.833 | 100% Verified |
| **Total** | | **120** | | |

### Year-by-Year Distribution (1995 – 2024):
| Year | Total Questions | GS1 Questions | CSAT GS2 Questions | Verification Status |
|---|---|---|---|---|
| **2024** | 76 | 32 | 44 | PUBLISHED |
| **2023** | 6 | 6 | 0 | PUBLISHED |
| **2022** | 2 | 1 | 1 | PUBLISHED |
| **2021** | 2 | 1 | 1 | PUBLISHED |
| **2020** | 2 | 1 | 1 | PUBLISHED |
| **2019** | 1 | 1 | 0 | PUBLISHED |
| **2018** | 2 | 2 | 0 | PUBLISHED |
| **2017** | 1 | 1 | 0 | PUBLISHED |
| **2016** | 1 | 1 | 0 | PUBLISHED |
| **2015** | 1 | 1 | 0 | PUBLISHED |
| **2014** | 1 | 1 | 0 | PUBLISHED |
| **2013** | 1 | 1 | 0 | PUBLISHED |
| **2012** | 1 | 1 | 0 | PUBLISHED |
| **2011** | 2 | 2 | 0 | PUBLISHED |
| **2010** | 1 | 1 | 0 | PUBLISHED |
| **2009** | 1 | 1 | 0 | PUBLISHED |
| **2008** | 1 | 1 | 0 | PUBLISHED |
| **2007** | 1 | 1 | 0 | PUBLISHED |
| **2006** | 1 | 1 | 0 | PUBLISHED |
| **2005** | 1 | 1 | 0 | PUBLISHED |
| **2004** | 1 | 1 | 0 | PUBLISHED |
| **2003** | 1 | 1 | 0 | PUBLISHED |
| **2002** | 1 | 1 | 0 | PUBLISHED |
| **2001** | 1 | 1 | 0 | PUBLISHED |
| **2000** | 1 | 1 | 0 | PUBLISHED |
| **1999** | 1 | 1 | 0 | PUBLISHED |
| **1998** | 1 | 1 | 0 | PUBLISHED |
| **1997** | 1 | 1 | 0 | PUBLISHED |
| **1996** | 2 | 2 | 0 | PUBLISHED |
| **1995** | 5 | 5 | 0 | PUBLISHED |

---

## 3. BILINGUAL CONTENT PARITY

- **Devanagari Hindi Present:** `39` questions (32.5%) have verified Hindi stems and option translations.
- **English Only (Ready for Hindi Linking):** `81` questions (67.5%).
- **Translation Linking Strategy:** Linking bilingual question stems via `questionGroupId` or dual fields `questionTextEn` and `questionTextHi` on the canonical Question entity.

---

## 4. ANSWER KEY PROVENANCE & VERIFICATION AUDIT

| Provenance Level | Key Type | Count | % of Database | Description |
|---|---|---|---|---|
| **Tier 1 (Authoritative)** | `UPSC_FINAL_KEY` | 120 | 100.0% | Official final answer key released post-representations |
| **Tier 2 (Provisional)** | `UPSC_PROVISIONAL_KEY` | 0 | 0.0% | Official provisional preliminary key |
| **Tier 3 (Corroborated)** | `INDEPENDENTLY_CORROBORATED` | 0 | 0.0% | Corroborated cross-institute consensus |
| **Tier 4 (Faculty Reviewed)**| `FACULTY_DERIVED` | 0 | 0.0% | Expert academic evaluation |
| **Tier 5 (Unverified)** | `UNVERIFIED` | 0 | 0.0% | Coaching speculative answers (Disallowed) |

---

## 5. EXISTING DATABASE SCHEMA ENTITIES REUSED

The pipeline reuses the following core Prisma models without modifying existing table identities:
1. `Question` (stores stem, paper, year, qNo, difficulty, marks, negativeMarks)
2. `QuestionOption` (`optionCode`, `optionTextEn`, `optionTextHi`, `isCorrect`)
3. `QuestionAnswer` (`answerOption`, `answerKeyType`, `answerProvenance`, `verificationStatus`)
4. `AnswerKeyVersion` (version tracking for post-provisional corrections)
5. `QuestionExplanation` (`summary`, `detailedExplanation`, `eliminationTechnique`, `sourceCitation`)
6. `Subject` and `Topic` (24-subject taxonomy hierarchy)
7. `QuestionTopic` (M:N taxonomy join table)
8. `QuestionSource` and `KnowledgeSource` (origin tracking and legal attribution)
9. `ContentImportJob` (ETL execution logging, status, counts)
10. `AuditLog` (admin batch changes, verification audit trail)

---

## 6. PRESERVATION & RE-ENTRANCY SAFEGUARDS

1. **Lock Verified Records:** Questions marked `status = 'PUBLISHED'` and `verificationStatus = 'OFFICIALLY_VERIFIED'` cannot have their official answer keys altered by automated scrapers.
2. **Canonical Deduplication Guard:** Any candidate record matching `(paperId, year, questionNumber)` triggers an update/enrichment pass (e.g., adding Hindi translation or citations) rather than creating a duplicate row.
3. **Dry-Run by Default:** All ingestion scripts must support `--dry-run` to inspect proposed mutations before touching the database.
