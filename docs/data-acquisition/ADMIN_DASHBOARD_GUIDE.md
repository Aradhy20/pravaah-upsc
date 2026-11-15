# Admin Ingestion Dashboard & Operations Guide

## 1. Dashboard Overview

The Admin Ingestion Dashboard is accessible to authenticated administrators at `/admin/ingestion`. It provides real-time control, durable pipeline audits, and metric telemetry over the multi-source data acquisition engine.

---

## 2. Key Interface Modules

### A. Global Action Ribbon
- **Run Source Health Check**: Triggers an automated HTTP ping and SSL verification across all 27 registered endpoints (`SourceRegistryRecord`).
- **Discover Papers**: Scans the official UPSC portals (`upsc.gov.in/examinations/previous-question-papers`) for newly published notifications and answer keys.
- **Run QA Audit**: Validates question banks for orphaned records, missing option codes, duplicate candidates, and unverified answer keys.

### B. Live KPI Strip
- **Registered Sources**: Displays total monitored endpoints and automated collection permission status.
- **Source Health**: Real-time ratio of healthy vs restricted endpoints.
- **Documents Discovered**: Total count of unique PDF and gazette source files indexed in `SourceDocument`.
- **NCERT Knowledge Base Metrics**: Real-time counts of books indexed (9), chapters mapped (44), and PYQ links created (12).
- **Exam Category Distribution**: Breakdown of questions across CSE, CDS, NDA, CAPF, and EPFO.

### C. Registered Multi-Source Directory
- Tabular inspection of all monitored domains.
- Displays HTTP response code, collection method (`DIRECT_DOCUMENT_DOWNLOAD`, `METADATA_DEEP_LINK`, `RSS`), and health status badge.

### D. Production Ingestion Artifacts & Export Manifests
- Instant downloads for real-time CSV reports:
  - `question_bank_coverage.csv`: All questions with 15 metadata fields.
  - `source_discovery_results.csv`: Complete source audit and WAF logs.
  - `duplicate_candidates.csv`: Semantic collision clusters and similarity scores.
  - `import_errors.csv`: Active defect tracking (currently 0 defects).

---

## 3. Administrative Security & Permissions

Access to `/admin/ingestion` and its corresponding API route `/api/v1/admin/ingestion` requires:
- Valid session JWT in `auth_token` HTTP-only cookie.
- Database `User.role === 'ADMIN'`. Non-admin users receive HTTP 403 Forbidden.
