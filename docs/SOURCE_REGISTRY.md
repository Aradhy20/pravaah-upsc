# PRAVAAH UPSC — AUTHORITATIVE SOURCE REGISTRY & DATA GOVERNANCE MATRIX
**Document Version:** 2.0.0  
**Last Audited & Synchronized:** 2026-11-28T10:31:16.747Z  
**Data Architecture Standard:** Zero Data Hallucination, Traceable Provenance & Academic Integrity  
**Target System:** Pravaah UPSC (https://pravaah-upsc.vercel.app/)  
**Competitive Reference:** Powerhouse PYQ (https://powerhouse-pyq.vercel.app/ - External Benchmark Only)  

---

## 1. Executive Policy & Ethical Scraping Guidelines

Pravaah UPSC maintains an uncompromising standard for content accuracy and academic legitimacy. Every question, answer key, explanation, and syllabus mapping adheres to strict legal, ethical, and academic protocols:

1. **Traceable Provenance:** Every question record stored in PostgreSQL must possess an unbroken lineage linking it to an official UPSC question paper PDF, official answer key gazette, or peer-reviewed academic publication.
2. **Strict Adherence to robots.txt & Terms of Service:** Automated crawlers never bypass authentication barriers, paywalls, or rate-limiting protocols. A polite minimum delay of 2.0 seconds is enforced across all network interactions.
3. **Exclusion of Proprietary Mockup Data:** Commercial question banks from external coaching institutes or competitor platforms (including Powerhouse PYQ) are never scraped, mirrored, or imported. Only official government notifications and permitted public datasets are ingested.
4. **Tiered Verification Model:**
   - **Tier 1 (Authoritative Primary):** Official UPSC, NCERT, PIB, PRS, India Code, Budget, and Ministry portals. Automatically eligible for publication upon OCR/checksum verification.
   - **Tier 2 (Corroborative Supplementary):** Educational platforms used strictly to cross-verify numbering, typo corrections, and bilingual terminology. All items remain in `AWAITING_VERIFICATION` until confirmed against Tier 1 documents.

---

## 2. Canonical Primary Sources (Tier 1: Official Authorities)

| # | Source Identifier | Entity & Portal | Canonical URL | Type | Collection Method | robots.txt | Priority |
| :- | :--- | :--- | :--- | :--- | :--- | :-: | :-: |
| 1 | `UPSC_PREV_PAPERS` | **UPSC Official Previous Question Papers** | [upsc.gov.in](https://upsc.gov.in/examinations/previous-question-papers) | `PRIMARY_OFFICIAL` | `DOCUMENT_DOWNLOAD` | `ALLOWED` | Tier 1 |
| 2 | `UPSC_ARCHIVED_PAPERS` | **UPSC CMS Archived Exam Documents** | [cms.upsc.gov.in](https://cms.upsc.gov.in/archived-exam-documents/question-papers/) | `PRIMARY_OFFICIAL` | `DOCUMENT_DOWNLOAD` | `ALLOWED` | Tier 1 |
| 3 | `UPSC_ANSWER_KEYS` | **UPSC Official Answer Keys Repository** | [upsc.gov.in](https://www.upsc.gov.in/exam-documents/answer-key/) | `PRIMARY_OFFICIAL` | `DOCUMENT_DOWNLOAD` | `ALLOWED` | Tier 1 |
| 4 | `UPSC_PREV_EXAM_DETAILS` | **UPSC Previous Examination Details & Cutoffs** | [upsc.gov.in](https://www.upsc.gov.in/previous-exam-details/) | `PRIMARY_OFFICIAL` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 5 | `NCERT_TEXTBOOKS` | **NCERT Digital Textbooks & Curriculum** | [ncert.nic.in](https://ncert.nic.in/textbook.php) | `GOVERNMENT_EDUCATIONAL` | `METADATA_DEEP_LINK` | `ALLOWED` | Tier 1 |
| 6 | `PIB_GOV_IN` | **Press Information Bureau (PIB)** | [pib.gov.in](https://pib.gov.in/) | `GOVERNMENT_COMMUNICATION` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 7 | `PRS_LEGISLATIVE_RESEARCH` | **PRS Legislative Research** | [prsindia.org](https://prsindia.org/) | `POLICY_RESEARCH` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 8 | `INDIA_CODE_PORTAL` | **India Code Digital Repository** | [indiacode.nic.in](https://www.indiacode.nic.in/) | `GOVERNMENT_LEGAL` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 9 | `UNION_BUDGET_INDIA` | **Union Budget of India (Ministry of Finance)** | [indiabudget.gov.in](https://www.indiabudget.gov.in/) | `GOVERNMENT_ECONOMIC` | `DOCUMENT_DOWNLOAD` | `ALLOWED` | Tier 1 |
| 10 | `RBI_NOTIFICATIONS` | **Reserve Bank of India (RBI)** | [rbi.org.in](https://www.rbi.org.in/) | `REGULATORY_AUTHORITY` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 11 | `ISRO_MISSIONS` | **Indian Space Research Organisation (ISRO)** | [isro.gov.in](https://www.isro.gov.in/) | `GOVERNMENT_SCIENCE` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 12 | `MOEFCC_GOV_IN` | **Ministry of Environment, Forest & Climate Change** | [moef.gov.in](https://moef.gov.in/) | `GOVERNMENT_ENVIRONMENT` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |
| 13 | `MEA_GOV_IN` | **Ministry of External Affairs (MEA)** | [mea.gov.in](https://www.mea.gov.in/) | `GOVERNMENT_DIPLOMATIC` | `INDEX_ONLY` | `ALLOWED` | Tier 1 |

### Primary Source Retrieval Protocols & Governance Details

#### `UPSC_PREV_PAPERS` — UPSC Official Previous Question Papers
- **Base URL:** [https://upsc.gov.in/examinations/previous-question-papers](https://upsc.gov.in/examinations/previous-question-papers)
- **Governance Domain:** `upsc.gov.in`
- **Scope:** Authoritative primary source for official UPSC CSE Prelims & Mains examination papers (PDF format).
- **Ingestion Rule:** Download authorized public question paper PDFs; respect 2-second polite delay between requests.
- **Terms & Compliance:** [Terms of Service](https://upsc.gov.in/terms-conditions)

#### `UPSC_ARCHIVED_PAPERS` — UPSC CMS Archived Exam Documents
- **Base URL:** [https://cms.upsc.gov.in/archived-exam-documents/question-papers/](https://cms.upsc.gov.in/archived-exam-documents/question-papers/)
- **Governance Domain:** `cms.upsc.gov.in`
- **Scope:** Historical archive repository for civil services and allied engineering/defence examinations.
- **Ingestion Rule:** Historical archive retrieval; cache locally with SHA-256 verification.
- **Terms & Compliance:** [Terms of Service](https://upsc.gov.in/terms-conditions)

#### `UPSC_ANSWER_KEYS` — UPSC Official Answer Keys Repository
- **Base URL:** [https://www.upsc.gov.in/exam-documents/answer-key/](https://www.upsc.gov.in/exam-documents/answer-key/)
- **Governance Domain:** `upsc.gov.in`
- **Scope:** Definitive benchmark for official Prelims answer keys across Series A, B, C, and D.
- **Ingestion Rule:** Distinguish between provisional and final answer keys; preserve dropped questions.
- **Terms & Compliance:** [Terms of Service](https://upsc.gov.in/terms-conditions)

#### `UPSC_PREV_EXAM_DETAILS` — UPSC Previous Examination Details & Cutoffs
- **Base URL:** [https://www.upsc.gov.in/previous-exam-details/](https://www.upsc.gov.in/previous-exam-details/)
- **Governance Domain:** `upsc.gov.in`
- **Scope:** Official notifications, vacancy counts, candidate demographics, and category cutoffs.
- **Ingestion Rule:** Index metadata and cutoff statistics for longitudinal aspirant analytics.
- **Terms & Compliance:** [Terms of Service](https://upsc.gov.in/terms-conditions)

#### `NCERT_TEXTBOOKS` — NCERT Digital Textbooks & Curriculum
- **Base URL:** [https://ncert.nic.in/textbook.php](https://ncert.nic.in/textbook.php)
- **Governance Domain:** `ncert.nic.in`
- **Scope:** Core foundational academic material covering History, Geography, Polity, Economy, and Science (Classes 6-12).
- **Ingestion Rule:** Chapter-level metadata linking; reference canonical curriculum nodes without whole-book replication.
- **Terms & Compliance:** [Terms of Service](https://ncert.nic.in/copyright.php)

#### `PIB_GOV_IN` — Press Information Bureau (PIB)
- **Base URL:** [https://pib.gov.in/](https://pib.gov.in/)
- **Governance Domain:** `pib.gov.in`
- **Scope:** Official government press releases, cabinet decisions, and flagship welfare scheme announcements.
- **Ingestion Rule:** Poll daily press releases; index ministry-wise releases for GS2 and GS3 current affairs.
- **Terms & Compliance:** [Terms of Service](https://pib.gov.in/terms.aspx)

#### `PRS_LEGISLATIVE_RESEARCH` — PRS Legislative Research
- **Base URL:** [https://prsindia.org/](https://prsindia.org/)
- **Governance Domain:** `prsindia.org`
- **Scope:** Independent legislative tracking, bill summaries, committee reports, and parliamentary debate analysis.
- **Ingestion Rule:** Deep-link bill tracks and policy briefs; extract bill status and Standing Committee recommendations.
- **Terms & Compliance:** [Terms of Service](https://prsindia.org/terms-of-use)

#### `INDIA_CODE_PORTAL` — India Code Digital Repository
- **Base URL:** [https://www.indiacode.nic.in/](https://www.indiacode.nic.in/)
- **Governance Domain:** `indiacode.nic.in`
- **Scope:** Central acts, state legislations, constitutional amendments, and statutory legal texts.
- **Ingestion Rule:** Map constitutional articles and statutory acts to Polity questions.
- **Terms & Compliance:** [Terms of Service](https://www.indiacode.nic.in/terms-and-conditions)

#### `UNION_BUDGET_INDIA` — Union Budget of India (Ministry of Finance)
- **Base URL:** [https://www.indiabudget.gov.in/](https://www.indiabudget.gov.in/)
- **Governance Domain:** `indiabudget.gov.in`
- **Scope:** Annual Financial Statement, Economic Survey, Fiscal Deficit trajectories, and Key to Budget documents.
- **Ingestion Rule:** Annual budget speech and Economic Survey chapter summarization for GS3 Economy.
- **Terms & Compliance:** [Terms of Service](https://www.indiabudget.gov.in/terms.php)

#### `RBI_NOTIFICATIONS` — Reserve Bank of India (RBI)
- **Base URL:** [https://www.rbi.org.in/](https://www.rbi.org.in/)
- **Governance Domain:** `rbi.org.in`
- **Scope:** Monetary policy committee statements, banking regulation directives, and macroeconomic statistics.
- **Ingestion Rule:** Capture bi-monthly MPC statements, inflation trends, and foreign exchange reserves.
- **Terms & Compliance:** [Terms of Service](https://www.rbi.org.in/Scripts/Disclaimer.aspx)

#### `ISRO_MISSIONS` — Indian Space Research Organisation (ISRO)
- **Base URL:** [https://www.isro.gov.in/](https://www.isro.gov.in/)
- **Governance Domain:** `isro.gov.in`
- **Scope:** Official mission payloads, launch vehicle milestones, satellite launches, and deep-space expeditions.
- **Ingestion Rule:** Track launch payloads, orbit insertions, and scientific achievements for GS3 Science & Tech.
- **Terms & Compliance:** [Terms of Service](https://www.isro.gov.in/terms.html)

#### `MOEFCC_GOV_IN` — Ministry of Environment, Forest & Climate Change
- **Base URL:** [https://moef.gov.in/](https://moef.gov.in/)
- **Governance Domain:** `moef.gov.in`
- **Scope:** National biodiversity targets, Ramsar wetland designations, wildlife sanctuaries, and COP climate stances.
- **Ingestion Rule:** Map environmental acts, protected areas, and climate summit declarations for GS3 Environment.
- **Terms & Compliance:** [Terms of Service](https://moef.gov.in/en/terms-conditions/)

#### `MEA_GOV_IN` — Ministry of External Affairs (MEA)
- **Base URL:** [https://www.mea.gov.in/](https://www.mea.gov.in/)
- **Governance Domain:** `mea.gov.in`
- **Scope:** Bilateral treaties, multilateral summits (G20, BRICS, Quad, SCO), and diplomatic policy statements.
- **Ingestion Rule:** Summarize state visits, agreements, and geopolitical positions for GS2 International Relations.
- **Terms & Compliance:** [Terms of Service](https://www.mea.gov.in/terms-conditions.htm)

---

## 3. Supplementary & Corroborative Sources (Tier 2: Educational Benchmarks)

| # | Source Identifier | Entity & Portal | Canonical URL | Type | Collection Method | robots.txt | Priority |
| :- | :--- | :--- | :--- | :--- | :--- | :-: | :-: |
| 1 | `UNLOCK_IAS_PORTAL` | **UnlockIAS Allied UPSC Exams Reference** | [unlockias.in](https://www.unlockias.in/) | `SUPPLEMENTARY_EDUCATIONAL` | `METADATA_DEEP_LINK` | `ALLOWED` | Tier 2 |
| 2 | `EXAMSIDE_QUESTIONS` | **ExamSIDE Competitive Examination Database** | [questions.examside.com](https://questions.examside.com/) | `SUPPLEMENTARY_EDUCATIONAL` | `METADATA_DEEP_LINK` | `ALLOWED` | Tier 2 |
| 3 | `EXAMGOAL_PORTAL` | **ExamGoal Examination Resource Hub** | [examgoal.com](https://www.examgoal.com/) | `SUPPLEMENTARY_EDUCATIONAL` | `METADATA_DEEP_LINK` | `ALLOWED` | Tier 2 |
| 4 | `IASBOARD_PORTAL` | **IASBoard Examination Intelligence** | [iasboard.com](https://www.iasboard.com/) | `SUPPLEMENTARY_EDUCATIONAL` | `METADATA_DEEP_LINK` | `ALLOWED` | Tier 2 |
| 5 | `DRISHTI_IAS_PORTAL` | **Drishti IAS Bilingual Preparation Hub** | [drishtiias.com](https://www.drishtiias.com/) | `SUPPLEMENTARY_EDUCATIONAL` | `INDEX_ONLY` | `ALLOWED` | Tier 2 |

### Supplementary Source Handling Policy

#### `UNLOCK_IAS_PORTAL` — UnlockIAS Allied UPSC Exams Reference
- **Base URL:** [https://www.unlockias.in/](https://www.unlockias.in/)
- **Governance Domain:** `unlockias.in`
- **Scope:** Taxonomy inspection and exam catalogue reference for CDS, CAPF, EPFO, and Geoscientist exams.
- **Strict Guardrail:** Secondary reference only; mark all extracted items as unverified until matched with official paper.

#### `EXAMSIDE_QUESTIONS` — ExamSIDE Competitive Examination Database
- **Base URL:** [https://questions.examside.com/](https://questions.examside.com/)
- **Governance Domain:** `questions.examside.com`
- **Scope:** Topic-wise question aggregation for cross-verification of question stems and options.
- **Strict Guardrail:** Cross-reference question numbering and option text; do not store commercial answer explanations.

#### `EXAMGOAL_PORTAL` — ExamGoal Examination Resource Hub
- **Base URL:** [https://www.examgoal.com/](https://www.examgoal.com/)
- **Governance Domain:** `examgoal.com`
- **Scope:** Competitive exam question catalog used for validation of chronological exam sequences.
- **Strict Guardrail:** Corroboration only; verify every question key against official UPSC final keys.

#### `IASBOARD_PORTAL` — IASBoard Examination Intelligence
- **Base URL:** [https://www.iasboard.com/](https://www.iasboard.com/)
- **Governance Domain:** `iasboard.com`
- **Scope:** Syllabus taxonomy and micro-theme classification benchmarks for Civil Services preparation.
- **Strict Guardrail:** Topic taxonomy benchmark only; proprietary content never stored.

#### `DRISHTI_IAS_PORTAL` — Drishti IAS Bilingual Preparation Hub
- **Base URL:** [https://www.drishtiias.com/](https://www.drishtiias.com/)
- **Governance Domain:** `drishtiias.com`
- **Scope:** Hindi-English bilingual terminological cross-referencing and Mains question archive corroboration.
- **Strict Guardrail:** Use strictly for terminology validation and bilingual lexicon disambiguation.

---

## 4. PostgreSQL Database Source Inventory (`SourceRegistryRecord`)

Total Configured Records in PostgreSQL: **43**

| Database ID | Source Code | Display Name | Domain | Priority | Health | Status Code | Last Audited |
| :--- | :--- | :--- | :--- | :-: | :-: | :-: | :--- |
| `cmwi7frpz00066fx...` | `DIGITAL_SANSAD_EPARLIB` | Digital Sansad Historical Parliamentary Debates & Archives | `https://eparlib.sansad.in/` | 1 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmwi7fp9p00046fx...` | `EPATHSHALA_PORTAL` | ePathshala National Digital Textbook Repository | `https://epathshala.nic.in/` | 1 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmx09skje0007147...` | `INDIA_CODE_PORTAL` | India Code Digital Repository | `indiacode.nic.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjg000a147...` | `ISRO_MISSIONS` | Indian Space Research Organisation (ISRO) | `isro.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjj000c147...` | `MEA_GOV_IN` | Ministry of External Affairs (MEA) | `mea.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skji000b147...` | `MOEFCC_GOV_IN` | Ministry of Environment, Forest & Climate Change | `moef.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fo7700036fx...` | `NCERT_OFFICIAL_PORTAL` | NCERT Textbook Portal | `https://ncert.nic.in/textbook.php` | 1 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmx09skja0004147...` | `NCERT_TEXTBOOKS` | NCERT Digital Textbooks & Curriculum | `ncert.nic.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fqi700056fx...` | `PIB_GOV_IN` | Press Information Bureau (PIB) | `pib.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjc0006147...` | `PRS_LEGISLATIVE_RESEARCH` | PRS Legislative Research | `prsindia.org` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjf0009147...` | `RBI_NOTIFICATIONS` | Reserve Bank of India (RBI) | `rbi.org.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjf0008147...` | `UNION_BUDGET_INDIA` | Union Budget of India (Ministry of Finance) | `indiabudget.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skj80002147...` | `UPSC_ANSWER_KEYS` | UPSC Official Answer Keys Repository | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skj50001147...` | `UPSC_ARCHIVED_PAPERS` | UPSC CMS Archived Exam Documents | `cms.upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fm7c00016fx...` | `UPSC_ARCHIVES` | UPSC Question Paper Archives | `https://www.upsc.gov.in/examinations/previous-question-papers/archives` | 1 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmwi7fn7100026fx...` | `UPSC_CMS_DETAILS` | UPSC Previous Exam Details & Archives | `https://cms.upsc.gov.in/previous-exam-details/` | 1 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmx09skj90003147...` | `UPSC_PREV_EXAM_DETAILS` | UPSC Previous Examination Details & Cutoffs | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fl4u00006fx...` | `UPSC_PREV_PAPERS` | UPSC Official Previous Question Papers | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `src_src-decodeci...` | `src-decodecivils-ref` | Decode Civils Current Affairs Portal | `decodecivils.com` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `rec_src-examday-...` | `src-examday-ref` | ExamDay AI UPSC Platform | `examday.ai` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `src_src-human-pe...` | `src-human-peritus-ref` | Human Peritus Specialist Exam Portal | `humanperitus.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `rec_src-iasboard...` | `src-iasboard-ref` | IASBoard UPSC Learning Portal | `iasboard.com` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `src_src-isro-mis...` | `src-isro-missions` | ISRO Missions & Science Announcements | `isro.gov.in` | 1 | 🔴 DEGRADED | 404 | 10/29/2026 |
| `src_src-pib-gov...` | `src-pib-gov` | Press Information Bureau (PIB) | `pib.gov.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `src_src-prs-indi...` | `src-prs-india` | PRS Legislative Research (Bill Track & Policy) | `prsindia.org` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `rec_src-question...` | `src-question-paper-milte-h` | Question Paper Milte H (Colloquial Query Canonical Resolution) | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `src_src-rbi-noti...` | `src-rbi-notifications` | Reserve Bank of India Press Releases & Notifications | `rbi.org.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `src_src-unlockia...` | `src-unlockias-ref` | UnlockIAS Other UPSC Exams Portal | `unlockias.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `rec_src-upsc-ans...` | `src-upsc-answer-keys` | UPSC Official Final Answer Keys Portal | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `rec_src-upsc-arc...` | `src-upsc-archive` | UPSC Question Papers Archive | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `src_src-upsc-off...` | `src-upsc-official-archive` | UPSC Official Question Papers Archive | `upsc.gov.in` | 1 | 🟢 ACTIVE | 403 | 10/29/2026 |
| `rec_src-upsc-pre...` | `src-upsc-prev-papers` | UPSC Official Previous Question Papers | `upsc.gov.in` | 1 | 🟢 ACTIVE | 200 | 10/29/2026 |
| `cmwi7fxub000b6fx...` | `CLEAR_IAS` | ClearIAS Educational Knowledge Base | `https://www.clearias.com/` | 2 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmwi7fvd400096fx...` | `DRISHTI_IAS` | Drishti IAS English/Hindi Portal | `https://www.drishtiias.com/` | 2 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmx09skjo000h147...` | `DRISHTI_IAS_PORTAL` | Drishti IAS Bilingual Preparation Hub | `drishtiias.com` | 2 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjm000f147...` | `EXAMGOAL_PORTAL` | ExamGoal Examination Resource Hub | `examgoal.com` | 2 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmx09skjl000e147...` | `EXAMSIDE_QUESTIONS` | ExamSIDE Competitive Examination Database | `questions.examside.com` | 2 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fwe1000a6fx...` | `FORUM_IAS` | ForumIAS Community & Discussions | `https://forumias.com/` | 2 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmwi7fyuc000c6fx...` | `IASBABA` | IASbaba Examination Prep Hub | `https://iasbaba.com/` | 2 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmx09skjn000g147...` | `IASBOARD_PORTAL` | IASBoard Examination Intelligence | `iasboard.com` | 2 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fubs00086fx...` | `INSIGHTS_IAS` | Insights on India | `https://www.insightsonindia.com/` | 2 | 🟢 ACTIVE | 200 | 11/16/2026 |
| `cmx09skjk000d147...` | `UNLOCK_IAS_PORTAL` | UnlockIAS Allied UPSC Exams Reference | `unlockias.in` | 2 | 🟢 ACTIVE | 200 | 11/28/2026 |
| `cmwi7fswm00076fx...` | `VISION_IAS` | Vision IAS Resource Portal | `https://visionias.in/` | 2 | 🟢 ACTIVE | 200 | 11/16/2026 |

---

## 5. Ingestion Verification Lifecycle

```
[Official Document PDF/Gazette]
             │
             ▼
[SHA-256 Checksum Validation] ──(Fails)──> [FAILED_DOCUMENTS.csv]
             │
             ▼ (Passes)
[PyMuPDF / pdfplumber Text Extraction]
             │
             ▼
[Deterministic Regex Parsing (Stem, Options, Paper, Year)]
             │
             ▼
[QuestionStagingRecord (status: AWAITING_VERIFICATION)]
             │
             ▼
[Official UPSC Answer Key Cross-Match (Series A/B/C/D)]
             │
             ▼
[Canonical Syllabus Mapping (SyllabusNode & Micro-Themes)]
             │
             ▼
[Promoted to Active Question Table (status: PUBLISHED)]
```

---
*End of Source Registry Document — Pravaah UPSC Master Data Engine.*
