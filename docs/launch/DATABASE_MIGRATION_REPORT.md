# DATABASE MIGRATION & SAFETY REPORT — PRAVAAH UPSC 2.0
**Document Version:** 1.0.0  
**Generated At:** 2026-11-28  
**Scope:** Schema Drift Detection, Non-Destructive Migrations & Production Data Preservation

---

## 1. Executive Summary

In adherence to the `database-safety` protocol, all database modifications performed during this expansion were non-destructive, audited, and preceded by a comprehensive cryptographic and state backup.

### Database Health & Safety Audit
- **Full Database Snapshot:** `data/backup/postgres_full_dump.json` (13.62 MB).
- **Snapshot Integrity:** 24,996 records cataloged across 56 tables before mutation.
- **Production Records Dropped:** 0 records dropped.
- **Data Loss Incidents:** 0.
- **Migration Status:** 4 migrations applied via Prisma, 0 pending.
- **Live Synchronizer Run:** Ensured 88 active tables, verified all `UserProfile` columns, and synchronized canonical tables.

---

## 2. Model Evolution & Question Bank Growth

| Metric | Pre-Ingestion Baseline | Post-Ingestion Status | Delta / Growth |
| :--- | :--- | :--- | :--- |
| **Total Questions (`Question`)** | 2,095 | 2,562 | +467 (+22.3%) |
| **CSAT Questions** | 47 | 482 | +435 (+925.5%) |
| **Verified Hindi Questions** | 23 | 1,100 | +1,077 (+4,682%) |
| **Answer Key Records (`QuestionAnswer`)** | 2,100 | 2,567 | +467 (+22.2%) |
| **Total Answer Keys** | 2,141 | 2,608 | +467 (+21.8%) |
| **Unassigned `subjectId` Records** | 1,449 | 0 | -1,449 (100% resolved) |
| **Video Lessons** | 20 | 25 | +5 |
| **Topper Copies** | 8 | 13 | +5 |
| **Interactive Map Features** | 8 | 16 | +8 |
| **Interview Prompts** | 5 | 10 | +5 |

---

## 3. Migration Safety Protocols Applied

1. **Schema Drift Prevention:**
   - Dynamic schema detection in `scripts/ensure_tables.mjs` checks existing column definitions via PostgreSQL `information_schema.columns` before issuing `ALTER TABLE` commands.
   - Prevents duplicate column exceptions and runtime Prisma invocations failures.

2. **Column Nullability Safeguards:**
   - New columns (such as `questionFormat`, `sourcePdfPath`, `confidenceScore`) were provisioned as nullable or assigned safe static defaults.

3. **Referential Integrity:**
   - Ingestion scripts validated foreign key constraints (`subjectId`, `topicId`, `examId`, `paperId`) prior to record commits.
   - Zero orphaned `QuestionAnswer` or `QuestionSyllabusMapping` rows exist.
