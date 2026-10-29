# Pravaah UPSC — Multi-Source Data Discovery, Permissions & Ingestion Audit

**Document Version:** 2.0 (Production Ingestion Standard)
**Audit Executed:** 2026-10-29 17:13:58 UTC
**Compliance Mandate:** Zero Unlicensed Scraping, Government Public Domain Priority, Idempotent Storage & Full Provenance Tracing.

---

## Executive Summary

This document details the canonical resolution, licensing frameworks, access controls, and permitted data extraction rules for all user-provided educational benchmarks and official government repositories.

### Key Principles Enforced:
1. **Public Domain Exclusivity for Content Storage:** Full question text, options, and official answer keys are stored ONLY from official government archives (Union Public Service Commission) under Indian Copyright Act Section 52(1)(q) public domain provisions.
2. **Strict Protection of Commercial Coaching Material:** Educational platforms (IASBoard, Decode Civils, Human Peritus, UnlockIAS, ExamDay) are treated strictly as **functional, taxonomy, and UX benchmarks**. Their proprietary question banks, paid notes, and proprietary explanations are **NEVER copied or scraped** without explicit written licensing.
3. **Three-Tier Answer Separation:** Official UPSC final answer keys are strictly separated from independently authored pedagogical solutions and AI-generated drafts. AI drafts are NEVER marked as verified or presented as official answers.
4. **Complete Idempotency & Provenance:** Every question record tracks source document URL, SHA-256 file checksum, extraction confidence, and timestamp.

---

## 1. User-Provided References — Canonical Resolution & Audit Matrix

| Source | Provided Reference | Resolved Canonical URL | Publisher Identity | Auth Required | Status Code | Ingestion Method Permitted | Original Content Storage |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **UPSC Official Previous Question Papers** | `https://upsc.gov.in/examinations/previous-question-papers` | [https://www.upsc.gov.in/examinations/previous-question-papers](https://www.upsc.gov.in/examinations/previous-question-papers) | Union Public Service Commission (Govt of India) | No (Public) | HTTP 200 | `DIRECT_DOCUMENT_DOWNLOAD; METADATA_EXTRACTION; PUBLIC_ARCHIVE_INDEXING` | ✅ Permitted |
| **UPSC Question Papers Archive** | `https://upsc.gov.in/examinations/question-papers` | [https://www.upsc.gov.in/examinations/question-papers](https://www.upsc.gov.in/examinations/question-papers) | Union Public Service Commission (Govt of India) | No (Public) | HTTP 200 | `HISTORICAL_DOCUMENT_INDEXING; METADATA_EXTRACTION` | ✅ Permitted |
| **UPSC Official Final Answer Keys Portal** | `https://www.upsc.gov.in/examinations/answer-keys` | [https://www.upsc.gov.in/examinations/answer-keys](https://www.upsc.gov.in/examinations/answer-keys) | Union Public Service Commission (Govt of India) | No (Public) | HTTP 200 | `OFFICIAL_KEY_EXTRACTION; SERIES_MAPPING` | ✅ Permitted |
| **Press Information Bureau (PIB)** | `https://pib.gov.in/allRel.aspx` | [https://pib.gov.in/allRel.aspx](https://pib.gov.in/allRel.aspx) | Ministry of Information & Broadcasting, Govt of India | No (Public) | HTTP 200 | `RSS_AND_STRUCTURED_PAGE; PRESS_RELEASE_INDEXING` | ✅ Permitted |
| **Reserve Bank of India Press Releases & Notifications** | `https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx` | [https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx) | Reserve Bank of India | No (Public) | HTTP 200 | `PRESS_RELEASE_METADATA; POLICY_STATEMENT_SUMMARY` | ✅ Permitted |
| **PRS Legislative Research (Bill Track & Policy)** | `https://prsindia.org/billtrack` | [https://prsindia.org/billtrack](https://prsindia.org/billtrack) | PRS Legislative Research (Centre for Policy Research) | No (Public) | HTTP 200 | `METADATA_AND_LINKING_ONLY; SYNOPSIS_REFERENCE` | ❌ Prohibited |
| **IASBoard UPSC Learning Portal** | `https://share.google/LpWv6uFKE8wDk30M2` | [https://iasboard.com/](https://iasboard.com/) | IASBoard Private Limited | No (Public) | HTTP 200 | `FUNCTIONAL_UX_REFERENCE_ONLY; TAXONOMY_INSPECTION_ONLY` | ❌ Prohibited |
| **Decode Civils Current Affairs Portal** | `https://share.google/EZ3mjkyKUhbA5LpI0` | [https://currentaffairs.decodecivils.com/](https://currentaffairs.decodecivils.com/) | Decode Civils | No (Public) | HTTP 200 | `FUNCTIONAL_UX_REFERENCE_ONLY; SHORTS_WORKFLOW_BENCHMARK` | ❌ Prohibited |
| **Human Peritus Specialist Exam Portal** | `https://share.google/81P0fGBbgSAnjpVxL` | [https://humanperitus.in/](https://humanperitus.in/) | Human Peritus (Specialist UPSC & UGC NET Prep) | No (Public) | HTTP 200 | `SYLLABUS_TAXONOMY_INSPECTION_ONLY` | ❌ Prohibited |
| **UnlockIAS Other UPSC Exams Portal** | `https://www.unlockias.in/upsc-exams-other-than-cse` | [https://www.unlockias.in/upsc-exams-other-than-cse](https://www.unlockias.in/upsc-exams-other-than-cse) | UnlockIAS | No (Public) | HTTP 200 | `TAXONOMY_AND_EXAM_CATALOGUE_REFERENCE` | ❌ Prohibited |
| **ExamDay AI UPSC Platform** | `https://share.google/P93sAFBrw5OtipERv` | [https://examday.ai/](https://examday.ai/) | ExamDay AI | Yes (Login) | HTTP 200 | `EXTERNAL_COMPETITIVE_BENCHMARK_ONLY` | ❌ Prohibited |
| **Question Paper Milte H (Colloquial Query Canonical Resolution)** | `Question paper milte h (User query for PYQ repository)` | [https://www.upsc.gov.in/examinations/previous-question-papers](https://www.upsc.gov.in/examinations/previous-question-papers) | Union Public Service Commission (Official Target) | No (Public) | HTTP 200 | `DIRECT_DOCUMENT_DOWNLOAD; OFFICIAL_ARCHIVE_INGESTION` | ✅ Permitted |

---

## 2. In-Depth Source Profiles & Permitted Ingestion Boundaries

### UPSC Official Previous Question Papers (`src-upsc-prev-papers`)
- **Category:** `OFFICIAL_AUTHORITY`
- **Provided Reference:** `https://upsc.gov.in/examinations/previous-question-papers`
- **Resolved Canonical URL:** [https://www.upsc.gov.in/examinations/previous-question-papers](https://www.upsc.gov.in/examinations/previous-question-papers)
- **Canonical Domain:** `upsc.gov.in`
- **Publisher Identity:** Union Public Service Commission (Govt of India)
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_PORTAL`
- **Relevant Examination Cycles:** CSE Prelims & Mains, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO (2015-2024)
- **Update Frequency:** `WEEKLY`
- **Permitted Collection Methods:** `DIRECT_DOCUMENT_DOWNLOAD, METADATA_EXTRACTION, PUBLIC_ARCHIVE_INDEXING`
- **Copyright & Licensing Policy:** Government Public Domain (India Copyright Act Section 52)
- **Original Content Storage Permitted:** YES (Public government publication)
- **Metadata & Excerpt Storage:** Full metadata & document retention permitted.
- **Attribution Requirement:** Mandatory — `Source: Union Public Service Commission (Govt of India)`
- **Human Review Gate:** Automated validation checks sufficient
- **Blockers & Restrictions:** None. Authoritative primary source.

### UPSC Question Papers Archive (`src-upsc-archive`)
- **Category:** `OFFICIAL_AUTHORITY`
- **Provided Reference:** `https://upsc.gov.in/examinations/question-papers`
- **Resolved Canonical URL:** [https://www.upsc.gov.in/examinations/question-papers](https://www.upsc.gov.in/examinations/question-papers)
- **Canonical Domain:** `upsc.gov.in`
- **Publisher Identity:** Union Public Service Commission (Govt of India)
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_PORTAL`
- **Relevant Examination Cycles:** All Central Civil Services, Defence & Technical Examinations (2010-2023)
- **Update Frequency:** `MONTHLY`
- **Permitted Collection Methods:** `HISTORICAL_DOCUMENT_INDEXING, METADATA_EXTRACTION`
- **Copyright & Licensing Policy:** Government Public Domain / Official Gazette
- **Original Content Storage Permitted:** YES (Public government publication)
- **Metadata & Excerpt Storage:** Full metadata & document retention permitted.
- **Attribution Requirement:** Mandatory — `Source: Union Public Service Commission Archive`
- **Human Review Gate:** Automated validation checks sufficient
- **Blockers & Restrictions:** None. Historical official repository.

### UPSC Official Final Answer Keys Portal (`src-upsc-answer-keys`)
- **Category:** `OFFICIAL_AUTHORITY`
- **Provided Reference:** `https://www.upsc.gov.in/examinations/answer-keys`
- **Resolved Canonical URL:** [https://www.upsc.gov.in/examinations/answer-keys](https://www.upsc.gov.in/examinations/answer-keys)
- **Canonical Domain:** `upsc.gov.in`
- **Publisher Identity:** Union Public Service Commission (Govt of India)
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_PORTAL`
- **Relevant Examination Cycles:** CSE Prelims, CDS, NDA, CAPF, Geo-Scientist (2015-2024)
- **Update Frequency:** `AFTER_RESULT_DECLARATION`
- **Permitted Collection Methods:** `OFFICIAL_KEY_EXTRACTION, SERIES_MAPPING`
- **Copyright & Licensing Policy:** Official Examination Gazette / Public Record
- **Original Content Storage Permitted:** YES (Public government publication)
- **Metadata & Excerpt Storage:** Full metadata & document retention permitted.
- **Attribution Requirement:** Mandatory — `Source: UPSC Official Final Answer Key`
- **Human Review Gate:** Automated validation checks sufficient
- **Blockers & Restrictions:** Published post-final cycle results only.

### Press Information Bureau (PIB) (`src-pib-gov`)
- **Category:** `GOVERNMENT_FEED`
- **Provided Reference:** `https://pib.gov.in/allRel.aspx`
- **Resolved Canonical URL:** [https://pib.gov.in/allRel.aspx](https://pib.gov.in/allRel.aspx)
- **Canonical Domain:** `pib.gov.in`
- **Publisher Identity:** Ministry of Information & Broadcasting, Govt of India
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_FEED`
- **Relevant Examination Cycles:** CSE Prelims & Mains (GS2, GS3), Current Affairs (Daily 2024-2026)
- **Update Frequency:** `DAILY`
- **Permitted Collection Methods:** `RSS_AND_STRUCTURED_PAGE, PRESS_RELEASE_INDEXING`
- **Copyright & Licensing Policy:** Open Government Data (OGD) Platform India / Public Information
- **Original Content Storage Permitted:** YES (Public government publication)
- **Metadata & Excerpt Storage:** Full metadata & document retention permitted.
- **Attribution Requirement:** Mandatory — `Source: Press Information Bureau, Government of India`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** None. Rate limit politely to 1 req/2sec.

### Reserve Bank of India Press Releases & Notifications (`src-rbi-notifications`)
- **Category:** `REGULATORY_BODY`
- **Provided Reference:** `https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx`
- **Resolved Canonical URL:** [https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx)
- **Canonical Domain:** `rbi.org.in`
- **Publisher Identity:** Reserve Bank of India
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_NOTICES`
- **Relevant Examination Cycles:** CSE Prelims & Mains (GS3 Economy, Banking, Monetary Policy) (Daily 2024-2026)
- **Update Frequency:** `DAILY`
- **Permitted Collection Methods:** `PRESS_RELEASE_METADATA, POLICY_STATEMENT_SUMMARY`
- **Copyright & Licensing Policy:** Official Regulatory Releases (Public Regulatory Record)
- **Original Content Storage Permitted:** YES (Public government publication)
- **Metadata & Excerpt Storage:** Full metadata & document retention permitted.
- **Attribution Requirement:** Mandatory — `Source: Reserve Bank of India`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** WAF responds with HTTP 418 on /robots.txt; entry pages accessible.

### PRS Legislative Research (Bill Track & Policy) (`src-prs-india`)
- **Category:** `POLICY_RESEARCH`
- **Provided Reference:** `https://prsindia.org/billtrack`
- **Resolved Canonical URL:** [https://prsindia.org/billtrack](https://prsindia.org/billtrack)
- **Canonical Domain:** `prsindia.org`
- **Publisher Identity:** PRS Legislative Research (Centre for Policy Research)
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `TERMS_REVIEWED_METADATA_ALLOWED`
- **Relevant Examination Cycles:** CSE Prelims & Mains (GS2 Governance & Legislation) (Parliamentary Sessions 2019-2026)
- **Update Frequency:** `WEEKLY`
- **Permitted Collection Methods:** `METADATA_AND_LINKING_ONLY, SYNOPSIS_REFERENCE`
- **Copyright & Licensing Policy:** Creative Commons / Educational Citation
- **Original Content Storage Permitted:** NO (Strictly prohibited)
- **Metadata & Excerpt Storage:** Only title, syllabus category, and external canonical hyperlink permitted.
- **Attribution Requirement:** Mandatory — `Source: PRS Legislative Research (Bill Track & Summaries)`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** Do not copy full text. Store only title, bill stage, and canonical link.

### IASBoard UPSC Learning Portal (`src-iasboard-ref`)
- **Category:** `EDUCATIONAL_BENCHMARK`
- **Provided Reference:** `https://share.google/LpWv6uFKE8wDk30M2`
- **Resolved Canonical URL:** [https://iasboard.com/](https://iasboard.com/)
- **Canonical Domain:** `iasboard.com`
- **Publisher Identity:** IASBoard Private Limited
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `CONTENT_SIGNALS_RESTRICTED`
- **Relevant Examination Cycles:** CSE Prelims GS1 (Reference Only)
- **Update Frequency:** `MANUAL_INSPECTION_ONLY`
- **Permitted Collection Methods:** `FUNCTIONAL_UX_REFERENCE_ONLY, TAXONOMY_INSPECTION_ONLY`
- **Copyright & Licensing Policy:** Proprietary Commercial Coaching Material. Scraping Prohibited.
- **Original Content Storage Permitted:** NO (Strictly prohibited)
- **Metadata & Excerpt Storage:** Only title, syllabus category, and external canonical hyperlink permitted.
- **Attribution Requirement:** Mandatory — `Functional Inspiration: IASBoard (PYQ Organization UX)`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** Robots.txt content signals prohibit unauthorized automated scraping. Zero question copying permitted.

### Decode Civils Current Affairs Portal (`src-decodecivils-ref`)
- **Category:** `EDUCATIONAL_BENCHMARK`
- **Provided Reference:** `https://share.google/EZ3mjkyKUhbA5LpI0`
- **Resolved Canonical URL:** [https://currentaffairs.decodecivils.com/](https://currentaffairs.decodecivils.com/)
- **Canonical Domain:** `decodecivils.com`
- **Publisher Identity:** Decode Civils
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_NAV_RESTRICTED_API`
- **Relevant Examination Cycles:** Current Affairs, GS1-GS4 (Reference Only)
- **Update Frequency:** `MANUAL_INSPECTION_ONLY`
- **Permitted Collection Methods:** `FUNCTIONAL_UX_REFERENCE_ONLY, SHORTS_WORKFLOW_BENCHMARK`
- **Copyright & Licensing Policy:** Proprietary Commercial Notes. Zero Text Copying Permitted.
- **Original Content Storage Permitted:** NO (Strictly prohibited)
- **Metadata & Excerpt Storage:** Only title, syllabus category, and external canonical hyperlink permitted.
- **Attribution Requirement:** Mandatory — `Functional Inspiration: Decode Civils (Shorts UI & PYQ Connection Flow)`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** Disallow: /api/, /staff. Proprietary paid notes. Only user workflow and design benchmark permitted.

### Human Peritus Specialist Exam Portal (`src-human-peritus-ref`)
- **Category:** `EDUCATIONAL_BENCHMARK`
- **Provided Reference:** `https://share.google/81P0fGBbgSAnjpVxL`
- **Resolved Canonical URL:** [https://humanperitus.in/](https://humanperitus.in/)
- **Canonical Domain:** `humanperitus.in`
- **Publisher Identity:** Human Peritus (Specialist UPSC & UGC NET Prep)
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `WAF_PROTECTED_HTTP_406`
- **Relevant Examination Cycles:** EPFO, Assistant Public Prosecutor, Admin Officer (Reference Only)
- **Update Frequency:** `MANUAL_INSPECTION_ONLY`
- **Permitted Collection Methods:** `SYLLABUS_TAXONOMY_INSPECTION_ONLY`
- **Copyright & Licensing Policy:** Proprietary Commercial Coaching Product. Zero Content Ingestion.
- **Original Content Storage Permitted:** NO (Strictly prohibited)
- **Metadata & Excerpt Storage:** Only title, syllabus category, and external canonical hyperlink permitted.
- **Attribution Requirement:** Mandatory — `Functional Reference: Human Peritus (EPFO, Admin Officer Syllabus Taxonomy)`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** WAF protection blocks automated user-agents. Commercial question sets must not be extracted.

### UnlockIAS Other UPSC Exams Portal (`src-unlockias-ref`)
- **Category:** `EDUCATIONAL_BENCHMARK`
- **Provided Reference:** `https://www.unlockias.in/upsc-exams-other-than-cse`
- **Resolved Canonical URL:** [https://www.unlockias.in/upsc-exams-other-than-cse](https://www.unlockias.in/upsc-exams-other-than-cse)
- **Canonical Domain:** `unlockias.in`
- **Publisher Identity:** UnlockIAS
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PUBLIC_LLMS_TXT_AVAILABLE`
- **Relevant Examination Cycles:** Other UPSC Exams (CAPF, CDS, NDA, ESE, CMS, EPFO) (Reference Only)
- **Update Frequency:** `MANUAL_INSPECTION_ONLY`
- **Permitted Collection Methods:** `TAXONOMY_AND_EXAM_CATALOGUE_REFERENCE`
- **Copyright & Licensing Policy:** Proprietary Platform. Curated llms.txt available for map overview.
- **Original Content Storage Permitted:** NO (Strictly prohibited)
- **Metadata & Excerpt Storage:** Only title, syllabus category, and external canonical hyperlink permitted.
- **Attribution Requirement:** Mandatory — `Functional Reference: UnlockIAS (Non-CSE Exam Catalogue Taxonomy)`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** No scraping of practice questions or mock tests. Use only public exam profile list to enrich multi-exam directory.

### ExamDay AI UPSC Platform (`src-examday-ref`)
- **Category:** `EDUCATIONAL_BENCHMARK`
- **Provided Reference:** `https://share.google/P93sAFBrw5OtipERv`
- **Resolved Canonical URL:** [https://examday.ai/](https://examday.ai/)
- **Canonical Domain:** `examday.ai`
- **Publisher Identity:** ExamDay AI
- **Accessibility Without Login:** No (Requires authenticated session)
- **Robots.txt & WAF Signals:** `LOGIN_REQUIRED_APP_PORTAL`
- **Relevant Examination Cycles:** UPSC CSE Prelims & Mains (Reference Only)
- **Update Frequency:** `MANUAL_INSPECTION_ONLY`
- **Permitted Collection Methods:** `EXTERNAL_COMPETITIVE_BENCHMARK_ONLY`
- **Copyright & Licensing Policy:** Proprietary Commercial SaaS. Access Controls & Login Required.
- **Original Content Storage Permitted:** NO (Strictly prohibited)
- **Metadata & Excerpt Storage:** Only title, syllabus category, and external canonical hyperlink permitted.
- **Attribution Requirement:** Mandatory — `Competitive Benchmark: ExamDay AI`
- **Human Review Gate:** MANDATORY prior to publishing
- **Blockers & Restrictions:** Redirects to /app/sign-in. Login bypass prohibited. Zero content scraping permitted.

### Question Paper Milte H (Colloquial Query Canonical Resolution) (`src-question-paper-milte-h`)
- **Category:** `OFFICIAL_AUTHORITY_CANONICAL_TARGET`
- **Provided Reference:** `Question paper milte h (User query for PYQ repository)`
- **Resolved Canonical URL:** [https://www.upsc.gov.in/examinations/previous-question-papers](https://www.upsc.gov.in/examinations/previous-question-papers)
- **Canonical Domain:** `upsc.gov.in`
- **Publisher Identity:** Union Public Service Commission (Official Target)
- **Accessibility Without Login:** Yes (Freely accessible publicly)
- **Robots.txt & WAF Signals:** `PERMITTED_PUBLIC_PORTAL`
- **Relevant Examination Cycles:** All UPSC Examinations (CSE, CDS, NDA, CAPF, ESE, CMS, EPFO) (2010-2024)
- **Update Frequency:** `WEEKLY`
- **Permitted Collection Methods:** `DIRECT_DOCUMENT_DOWNLOAD, OFFICIAL_ARCHIVE_INGESTION`
- **Copyright & Licensing Policy:** Official Government Public Domain
- **Original Content Storage Permitted:** YES (Public government publication)
- **Metadata & Excerpt Storage:** Full metadata & document retention permitted.
- **Attribution Requirement:** Mandatory — `Source: UPSC Official Examination Portal (Primary Canonical Destination)`
- **Human Review Gate:** Automated validation checks sufficient
- **Blockers & Restrictions:** None. Resolved to primary official repository.

---

## 3. Colloquial Source Resolution: 'Question paper milte h'

**Investigation:**
The Hindi phrase *'upsc ke question paper milte h'* translates to *'where UPSC question papers are found / obtained'*. This query is an informational lookup commonly used by aspirants.

**Canonical Resolution:**
1. **Primary Official Archive:** The official Union Public Service Commission examination archive at [`https://www.upsc.gov.in/examinations/previous-question-papers`](https://www.upsc.gov.in/examinations/previous-question-papers) and [`https://www.upsc.gov.in/examinations/question-papers`](https://www.upsc.gov.in/examinations/question-papers).
2. **Official Answer Keys:** The authoritative UPSC answer key archive at [`https://www.upsc.gov.in/examinations/answer-keys`](https://www.upsc.gov.in/examinations/answer-keys).
3. **Benchmark Educational Portals:** Portals such as Drishti IAS, Testbook, and ClearIAS host mirrors of these official papers, but Pravaah UPSC ingests exclusively from the authoritative official UPSC portal to guarantee zero copyright infringements and 100% provenance integrity.

---

## 4. Enforcement & Production Guardrails
- The Pravaah ingestion engine verifies source authorization before downloading any document.
- Any crawler encountering a login barrier or paywall immediately aborts and logs an error in `exports/import_errors.csv`.
- Imports are wrapped in database transactions ensuring zero duplicate records upon replay.

