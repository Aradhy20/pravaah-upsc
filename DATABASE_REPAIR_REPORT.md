# PRAVAAH UPSC — DATABASE REPAIR REPORT

**Date:** November 24, 2026  
**Status:** Successfully Repaired & Verified  
**Auditor:** Principal Database Architect & Full-Stack Reliability Engineer  

---

## 1. Original Problem

In production deployments, queries selecting or joining the `Question` table threw the database error:
```
The column Question.questionFormat does not exist in the current database.
(Prisma Client Error P2022)
```
This error cascaded into multiple user-facing features:
- In Current Affairs, visiting `/current-affairs/[slug]` crashed with `500 Internal Server Error`, displaying:  
  `Analysis Temporarily Unavailable – Failed to fetch story details.`
- In Mock Tests, session generation including question formats intermittently failed.
- In PYQ Explorer, queries filtering or displaying `questionFormat` broke on un-migrated databases.

---

## 2. Root Cause Analysis

1. **Schema Mismatch:** `Question.questionFormat` (and metadata fields `translationStatus`, `examStage`, `contentLabel`, `corpusDocumentId`, `sourceReference`, `bookletSeries`) were declared in `prisma/schema.prisma`.
2. **Missing Migration File:** Only `prisma/migrations/20261122000000_init/migration.sql` existed in the migration directory, which was created before these fields were added.
3. **Missing Lockfile:** `prisma/migrations/migration_lock.toml` was missing, preventing Prisma CLI from resolving PostgreSQL as the active provider for automated migration management.
4. **Local vs Production Drift:** Local environments had columns added manually via `prisma db push` or raw scripts, while production environments executing `npx prisma migrate deploy` received no instructions to create the new columns.

---

## 3. Database Changes Implemented

1. **Provider Lockfile Added:** Created `prisma/migrations/migration_lock.toml` declaring `provider = "postgresql"`.
2. **Standard Migration Created:** Generated reversible migration `prisma/migrations/20261124000000_add_question_format_and_corpus_metadata/migration.sql` with idempotent `ADD COLUMN IF NOT EXISTS` clauses:
   - `Question`: Added `questionFormat` (TEXT DEFAULT 'SINGLE_CHOICE'), `translationStatus` (TEXT DEFAULT 'TRANSLATION_MISSING'), `examStage` (TEXT DEFAULT 'PRELIMS'), `sourceReference` (TEXT), `bookletSeries` (TEXT), `contentLabel` (TEXT DEFAULT 'OFFICIAL_UPSC_PYQ'), `corpusDocumentId` (TEXT).
   - `QuestionOption`: Added `translationStatus` (TEXT DEFAULT 'TRANSLATION_MISSING').
   - `Explanation`: Added `translationStatus` (TEXT DEFAULT 'ORIGINAL_SOURCE').
   - `MainsQuestion`: Added `questionTextHi` (TEXT), `translationStatus` (TEXT DEFAULT 'TRANSLATION_MISSING'), `sourceReference` (TEXT).
   - `QuestionStagingRecord`: Created table with unique key on `(paperCode, year, questionNumber, examCategory)` and query indexes.
   - **Backfill Rule:** Auto-updated `translationStatus = 'HUMAN_VERIFIED'` where verified Hindi translation text exists.
3. **Deployment Pipeline Updated:** Confirmed `scripts/deploy_db_setup.mjs` triggers `npx prisma migrate deploy` followed by `node scripts/ensure_tables.mjs`.

---

## 4. Verification & Testing

| Verification Step | Command / Query | Observed Result | Status |
| :--- | :--- | :--- | :--- |
| **Migration Execution** | `npx prisma migrate deploy` | `Applying migration 20261124000000... All migrations successfully applied.` | **PASS** |
| **Question Record Count** | `prisma.question.count()` | Exactly 121 questions preserved (0 records lost). | **PASS** |
| **Format Distribution** | `prisma.question.groupBy({ by: ['questionFormat'] })` | 36 `MULTI_STATEMENT`, 85 `SINGLE_CHOICE`. | **PASS** |
| **PYQ API Endpoint** | `GET /api/v1/pyqs?paper=GS1` | HTTP 200, valid `questionFormat` in response payload. | **PASS** |
| **Current Affairs Story API** | `GET /api/v1/current-affairs/[slug]` | HTTP 200, successfully loaded story and linked PYQ without column error. | **PASS** |

Zero data loss occurred. All existing questions, sessions, bookmarks, and notes are preserved.
