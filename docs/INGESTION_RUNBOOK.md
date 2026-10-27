# Pravaah UPSC — Historical Question Bank Ingestion Runbook

## 1. Overview & Operating Principles
This runbook guides data engineers and administrators in discovering, extracting, validating, and publishing official historical question papers into the Pravaah UPSC database.

### Core Safeguards:
- **Zero Hallucination:** Only authentic UPSC/State PSC question papers with verified answer keys are ingested.
- **Atomic Batches:** All operations run with dry-run previews, row-level validation, and rollback capability.
- **Disputed Key Traceability:** Any dropped or multi-answer questions must be documented with official notification numbers.

---

## 2. Ingestion Workflow & CLI Commands

### Step 1: Discover Official Papers & Checksums
Run the official UPSC archive discovery tool to catalog available papers:
```bash
python3 scripts/discover_upsc_papers.py
```
This inspects the official catalog, checks remote document checksums (SHA-256), page counts, and registers entries in `data/source_documents/source_registry.json`.

### Step 2: Source Permission & Health Audit
Before scraping or downloading, audit source status and permission constraints:
```bash
python3 scripts/audit_sources.py
```
Outputs audit reports to `docs/SOURCE_PERMISSION_MATRIX.md` verifying robots.txt compliance and connection latency.

### Step 3: Question Extraction (PDF -> Structured JSON)
Use PyMuPDF / pdfplumber extraction to parse question stems, sub-statements, and 4 options:
```bash
python3 scripts/extract_questions.py --input-pdf <path_to_pdf> --exam CSE --year 2024 --paper GS1
```
Validation rules enforced during extraction:
- Exact 4 options (A, B, C, D)
- Mathematical and Roman numeral preservation (`(a)`, `(i)`, `(ii)`)
- Removal of exam booklet headers and footers

### Step 4: Dry-Run Validation & Quality Verification
Before writing to the database, run quality validation:
```bash
python3 scripts/validate_question_bank.py --dry-run
```
Checks:
- Missing options or empty stems
- Key Series A alignment
- Duplicate text similarity candidates (>85% trigram match)
- Provenance links to valid `SourceDocument` IDs

### Step 5: Database Ingestion
Ingest the validated batch into the database:
```bash
python3 scripts/ingest_historical_catalog.py --batch-file exports/validated_batch.json
```
This executes an idempotent `upsert`:
- If `(examCode, year, paperCode, questionNumber)` exists, updates metadata without dropping user attempts.
- If new, creates `Question`, `QuestionOption` (4 records), `Explanation`, `QuestionTopic`, and `QuestionSource`.

---

## 3. Handling Disputed, Dropped, or Multi-Option Keys
When UPSC issues a corrigendum or final revised answer key:
1. Update `AnswerKeyVersion` table with the revision date and notification Gazette number.
2. If dropped: Set `officialKey = "DROPPED"`. In the exam scoring engine (`lib/scoring.ts`), dropped questions are awarded marks or normalized automatically according to UPSC guidelines.
3. If multiple keys: Set `officialKey = "A/C"` to accept either option.

---

## 4. Rollback & Emergency Recovery
If a corrupted batch is accidentally introduced:
1. Restore database snapshot from `data/backups/`:
   ```bash
   cp data/backups/dev_baseline_backup.db prisma/dev.db
   ```
2. For PostgreSQL in production, restore point-in-time recovery WAL or snapshot backup.
3. Unpublish corrupted records via the Admin API:
   ```bash
   POST /api/v1/admin/publish {"questionIds": [...], "status": "WITHDRAWN"}
   ```
