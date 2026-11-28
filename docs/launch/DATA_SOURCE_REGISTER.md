# DATA_SOURCE_REGISTER.md: PRAVAAH UPSC OFFICIAL SOURCE CATALOG

**Registry Version:** 2.0  
**Authority:** Principal Data Engineer & Legal Compliance Lead  
**Audit Baseline:** 28 November 2026  

---

## 1. REGISTERED DATA SOURCES

| Source ID | Source Name | Canonical URL | Access Method | Provenance Authority | Content Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-UPSC-OFFICIAL** | Union Public Service Commission | `https://www.upsc.gov.in/` | Public Gazette / PDF Download | Primary Official Authority | CSE Prelims, Mains & Final Answer Keys |
| **SRC-EXAMSIDE-PUBLIC** | ExamSide / ExamGOAL Research | `https://questions.examside.com/` | Public PDF Ingestion / Local Archive | Authorized Research Reference | Chapter-wise & Year-wise Bilingual PYQs |
| **SRC-NCERT-OFFICIAL** | National Council of Educational Research & Training | `https://ncert.nic.in/` | Educational Public Access | Foundational Textbooks | Classes 6–12 History, Polity, Geography, Economy |
| **SRC-PIB-GOV** | Press Information Bureau (PIB) | `https://pib.gov.in/` | Public RSS & Newsfeed | Official Government Press | Daily Current Affairs, Cabinet Decisions |
| **SRC-PRS-INDIA** | PRS Legislative Research | `https://prsindia.org/` | Public Policy Trackers | Public Interest Policy Analysis | Bills, Acts, Parliamentary Standing Committee Reports |
| **SRC-RBI-REPORTS** | Reserve Bank of India | `https://rbi.org.in/` | Public Regulatory Notifications | Official Monetary Authority | Monetary Policy, Financial Stability Reports |

---

## 2. INGESTION POLICIES & BOUNDARIES

1. **Zero Scraping Abuse:** Never execute headless scrapers against rate-limited endpoints or bypass CAPTCHAs.
2. **Offline-First Resilience:** Ingest verified local archival PDFs (`data/imports/examgoal/`) with SHA-256 verification.
3. **Immutability of Official Keys:** UPSC final answer keys supersede all third-party coaching solutions.
4. **Devanagari Preservation:** Retain official Hindi phrasing without machine translation alteration.
