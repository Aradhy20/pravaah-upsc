# Pravaah UPSC — Source Governance & Permission Matrix

**Compliance Standard:** Ethical Data Ingestion, Public Domain Priority & Zero Unlicensed Scraping
**Auditor:** Principal Data Architect & Ingestion Specialist
**Audit Timestamp:** 2026-10-29 17:13:58 UTC

---

## 1. Multi-Source Permission & Attribution Matrix

| Source Name | Category | Allowed Ingestion Method | Licensing & Usage Rules | Attribution Required | Human Review | Health |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **UPSC Official Previous Question Papers** | `OFFICIAL_AUTHORITY` | `DIRECT_DOCUMENT_DOWNLOAD; METADATA_EXTRACTION; PUBLIC_ARCHIVE_INDEXING` | Government Public Domain (India Copyright Act Section 52) | Mandatory | Automated | 🟢 Healthy |
| **UPSC Question Papers Archive** | `OFFICIAL_AUTHORITY` | `HISTORICAL_DOCUMENT_INDEXING; METADATA_EXTRACTION` | Government Public Domain / Official Gazette | Mandatory | Automated | 🟢 Healthy |
| **UPSC Official Final Answer Keys Portal** | `OFFICIAL_AUTHORITY` | `OFFICIAL_KEY_EXTRACTION; SERIES_MAPPING` | Official Examination Gazette / Public Record | Mandatory | Automated | 🟢 Healthy |
| **Press Information Bureau (PIB)** | `GOVERNMENT_FEED` | `RSS_AND_STRUCTURED_PAGE; PRESS_RELEASE_INDEXING` | Open Government Data (OGD) Platform India / Public Information | Mandatory | Mandatory | 🟢 Healthy |
| **Reserve Bank of India Press Releases & Notifications** | `REGULATORY_BODY` | `PRESS_RELEASE_METADATA; POLICY_STATEMENT_SUMMARY` | Official Regulatory Releases (Public Regulatory Record) | Mandatory | Mandatory | 🟢 Healthy |
| **PRS Legislative Research (Bill Track & Policy)** | `POLICY_RESEARCH` | `METADATA_AND_LINKING_ONLY; SYNOPSIS_REFERENCE` | Creative Commons / Educational Citation | Mandatory | Mandatory | 🟢 Healthy |
| **IASBoard UPSC Learning Portal** | `EDUCATIONAL_BENCHMARK` | `FUNCTIONAL_UX_REFERENCE_ONLY; TAXONOMY_INSPECTION_ONLY` | Proprietary Commercial Coaching Material. Scraping Prohibited. | Mandatory | Mandatory | 🟢 Healthy |
| **Decode Civils Current Affairs Portal** | `EDUCATIONAL_BENCHMARK` | `FUNCTIONAL_UX_REFERENCE_ONLY; SHORTS_WORKFLOW_BENCHMARK` | Proprietary Commercial Notes. Zero Text Copying Permitted. | Mandatory | Mandatory | 🟢 Healthy |
| **Human Peritus Specialist Exam Portal** | `EDUCATIONAL_BENCHMARK` | `SYLLABUS_TAXONOMY_INSPECTION_ONLY` | Proprietary Commercial Coaching Product. Zero Content Ingestion. | Mandatory | Mandatory | 🟢 Healthy |
| **UnlockIAS Other UPSC Exams Portal** | `EDUCATIONAL_BENCHMARK` | `TAXONOMY_AND_EXAM_CATALOGUE_REFERENCE` | Proprietary Platform. Curated llms.txt available for map overview. | Mandatory | Mandatory | 🟢 Healthy |
| **ExamDay AI UPSC Platform** | `EDUCATIONAL_BENCHMARK` | `EXTERNAL_COMPETITIVE_BENCHMARK_ONLY` | Proprietary Commercial SaaS. Access Controls & Login Required. | Mandatory | Mandatory | 🟢 Healthy |
| **Question Paper Milte H (Colloquial Query Canonical Resolution)** | `OFFICIAL_AUTHORITY_CANONICAL_TARGET` | `DIRECT_DOCUMENT_DOWNLOAD; OFFICIAL_ARCHIVE_INGESTION` | Official Government Public Domain | Mandatory | Automated | 🟢 Healthy |

---

## 2. Permitted vs. Prohibited Ingestion Practices

### Allowed Practices:
1. Ingestion of official UPSC examination papers, notifications, and answer keys.
2. Collection of public press releases from PIB, RBI, and official ministries.
3. Ingestion of PRS India public legislative metadata with proper canonical attribution.
4. Independent pedagogical authoring of explanations with strict reviewer sign-off.

### Strictly Prohibited Practices:
1. Scraping proprietary questions, paid notes, or explanations from IASBoard, Decode Civils, Human Peritus, UnlockIAS, or ExamDay.
2. Bypassing login credentials, CAPTCHAs, or paywalls.
3. Storing third-party paid content in the database.
4. Misrepresenting AI-generated draft explanations as official UPSC keys.

