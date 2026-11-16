# Pravaah UPSC: Master Library Extraction & Ingestion Run Log

## 1. Execution Header

- **Run ID**: `RUN-MASTER-INGEST-20261116-01`
- **Script Executed**: `node scripts/ingest_master_library.mjs`
- **Environment**: Production Staging (Neon PostgreSQL Pooled Instance)
- **Start Timestamp**: `2026-11-16T14:01:44.575Z`
- **Completion Timestamp**: `2026-11-16T14:03:13.911Z`
- **Total Duration**: `89,336 ms (~1.48 minutes)`
- **Exit Code**: `0 (SUCCESS)`

---

## 2. Ingestion Step Breakdown & Metrics

```
Starting Optimized Pravaah UPSC Master Library Ingestion Engine...
1. Ingesting 14 Examination Families...
   - Upserted: CSE, IFoS, CAPF, CDS, NDA, ESE, CMS, IES_ISS, GEO, EPFO_EO, EPFO_APFC, CBI_DSP, CISF_AC, SCRA.
   - Status: Complete (14 / 14)

2. Ingesting Year Harvest Tracker (448 rows)...
   - Parsed: chat/10_DATASET_EXPORTS/year_exam_harvest_tracker.csv
   - Batch size: 200 items per chunk
   - Ingested: 448 ExamYear historical tracking rows.
   - Status: Complete (448 / 448)

3. Ingesting Knowledge Sources Catalog...
   - Parsed: chat/00_README_AND_CATALOG/source_catalog.csv
   - Parsed: Pravaah_Provided_Sources_Extraction/00_README/resource_catalog.csv
   - Ingested: 74 Knowledge Sources with fair dealing & official rights metadata.
   - Status: Complete (74 / 74)

4. Ingesting Subtopics & Syllabus Topics...
   - Cross-mapped with 53 SyllabusNode entities.
   - SyllabusTopics ready.

5. Batch Normalizing QuestionAnswers and Citations...
   - Found: 1,123 questions needing QuestionAnswer normalization.
   - Created: 1,123 QuestionAnswer records (Precedence: UPSC_FINAL_KEY).
   - Created: 1,123 SourceCitation records (Official Gazette Evidence).
   - Created: 1,123 QuestionSyllabusMapping records.
   - Status: Complete (100% Normalized)

6. Ingesting Bilingual Questions...
   - Ingested high-fidelity bilingual question pairs (English + Hindi Devanagari) with question_group_id linkage.

==========================================
Master Library Ingestion Run Completed!
- ExamYears Indexed: 448
- KnowledgeSources Indexed: 74
- Questions in DB: 1,123
- QuestionAnswers Verified: 1,123
- Time: 89336ms
==========================================
```

---

## 3. Database Audit Record

The run automatically recorded an audit entry in the `IngestionJobAudit` table:
- **Job Type**: `MASTER_LIBRARY_INGESTION_RUN`
- **Status**: `COMPLETED`
- **Total Processed**: `1,123`
- **Total Errors**: `0`
- **Duration**: `89.34 seconds`
- **Audit Token**: `AUDIT-MASTER-20261116`
