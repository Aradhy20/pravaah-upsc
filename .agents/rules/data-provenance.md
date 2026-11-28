# Data Provenance Rule

1. **Mandatory Provenance Attributes**:
   - Every published question and staging record must carry traceable lineage:
     - `examYear`
     - `paper` (GS1 / CSAT)
     - `bookletSeries` (Series A/B/C/D)
     - `bookletQuestionNumber`
     - `officialKeySource`
     - `syllabusTopic`

2. **Audit Trails & Verification States**:
   - Track verification status (`UNVERIFIED`, `STAGED`, `OFFICIALLY_VERIFIED`, `RECONCILED`).
   - Record timestamps and scripts responsible for ingest, transformation, and promotion.
   - Never promote staging records without complete option sets and verified answer keys.
