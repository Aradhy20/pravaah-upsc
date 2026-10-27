# Pravaah UPSC — Source Governance & Permission Matrix

**Compliance Standard:** Ethical Data Ingestion, Public Domain Priority & Zero Unlicensed Scraping
**Auditor:** Principal Data Architect & Security Engineer
**Audit Timestamp:** 2026-10-27 18:38:31 UTC

---

## 1. Multi-Source Permission & Attribution Matrix

| Source Name | Category | Allowed Ingestion Method | Licensing & Usage Rules | Attribution Required | Human Review | Health |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **UPSC Official Question Papers Archive** | `OFFICIAL_EXAM_BODY` | `DIRECT_DOCUMENT_DOWNLOAD` | Government Public Domain / Official Gazette | Mandatory | Automated | 🟢 Healthy (425.43ms) |
| **Press Information Bureau (PIB)** | `OFFICIAL_GOVERNMENT_FEED` | `RSS_AND_STRUCTURED_PAGE` | Government Public Information (National Portal of India) | Mandatory | Mandatory | 🟢 Healthy (240.76ms) |
| **PRS Legislative Research** | `POLICY_RESEARCH` | `METADATA_AND_LINKING_ONLY` | Creative Commons / Educational Reference with Attribution | Mandatory | Mandatory | 🟢 Healthy (523.92ms) |
| **Reserve Bank of India (RBI) Press Releases** | `REGULATORY_BODY` | `PUBLIC_PRESS_RELEASES_ONLY` | Official Regulatory Notifications | Mandatory | Mandatory | 🟢 Healthy (537.69ms) |
| **ISRO Missions & Science Announcements** | `SCIENCE_AGENCY` | `DIRECT_PAGE_METADATA` | Official Space Agency Releases (Dept of Space, GoI) | Mandatory | Automated | 🔴 Inaccessible (136.04ms) |
| **UnlockIAS Other UPSC Exams Reference** | `FUNCTIONAL_BENCHMARK` | `FUNCTIONAL_UX_REFERENCE_ONLY` | Proprietary Commercial Website. Zero Content Copying. | Mandatory | Mandatory | 🟢 Healthy (325.57ms) |
| **Decode Civils Current Affairs Reference** | `FUNCTIONAL_BENCHMARK` | `FUNCTIONAL_UX_REFERENCE_ONLY` | Proprietary Commercial Coaching Product. Zero Content Copying. | Mandatory | Mandatory | 🟢 Healthy (450.14ms) |
| **Human Peritus Specialist Exam Reference** | `FUNCTIONAL_BENCHMARK` | `SYLLABUS_TAXONOMY_INSPECTION_ONLY` | Proprietary Commercial Coaching Provider. Zero Content Copying. | Mandatory | Mandatory | 🔴 Inaccessible (334.18ms) |

---

## 2. Ethical Collection & Anti-Scraping Mandates
1. **Primary Content Authority:** Official public examination papers and answer keys published by the Union Public Service Commission (`upsc.gov.in`) form 100% of the active question bank.
2. **Official Government Feeds:** Daily current affairs utilize direct Press Information Bureau (`pib.gov.in`) and ministry gazettes, transforming raw policy releases into syllabus-mapped learning summaries.
3. **Zero Content Copying from Competitors:** Competitor websites (Decode Civils, UnlockIAS, Human Peritus, IASBoard) are utilized **strictly as functional and architectural references**. Under no circumstances are their proprietary question copies, explanations, or user content scraped or reproduced.
4. **AI Output Gating:** AI models may assist in tagging syllabus papers and drafting explanatory summaries, but every published learning story and MCQ must pass human editorial verification.
