# PHASE 3: TRUSTED SOURCE REGISTRY & LEGAL COMPLIANCE MATRIX
**Application:** Pravaah UPSC  
**Live Platform:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**Version:** 3.0  
**Effective Date:** November 23, 2026  
**Auditor:** Senior Data Engineer, Compliance & Research Specialist  

---

## 1. Source Hierarchy & Ingestion Policy

To ensure unquestionable academic integrity and total compliance with intellectual property laws, Pravaah UPSC maintains a three-tier source verification hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: PRIMARY OFFICIAL GOVERNMENT SOURCES (Priority 1)    │
│ • UPSC Official Question Booklets (Series A/B/C/D)          │
│ • UPSC Official Final Answer Keys (Post-Dispute Resolutions)│
│ • Press Information Bureau (PIB), Gazette of India          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Corroboration & Taxonomies
┌──────────────────────────────▼──────────────────────────────┐
│ TIER 2: SECONDARY EDUCATIONAL CORROBORATION (Priority 2)    │
│ • ExamGOAL (PDF Archives & Paper Verification)              │
│ • ExamSIDE (Taxonomy & Syllabus Mapping)                    │
│ • UnlockIAS / IASboard / Decode Civils (Topic Cross-Checks) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Pedagogical Grounding
┌──────────────────────────────▼──────────────────────────────┐
│ TIER 3: STATUTORY & PEDAGOGICAL REFERENCES (Priority 3)     │
│ • NCERT Textbooks (Classes 6–12)                            │
│ • India Code / Supreme Court Judgments                      │
│ • Standard Reference Works (Laxmikanth, Ramesh Singh, etc.) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Source Registry Catalog & Permitted Collection Methods

| Source ID | Source Name & Domain | Classification | Priority | Permitted Collection | License & Legal Boundaries |
|:---|:---|:---:|:---:|:---:|:---|
| **UPSC_OFFICIAL** | Union Public Service Commission<br>`upsc.gov.in` | OFFICIAL_GOVERNMENT | 1 | `DOCUMENT_DOWNLOAD` | Public domain official examination papers and answer keys. 100% authoritative. |
| **UPSC_ARCHIVES** | UPSC Historical Archives<br>`cms.upsc.gov.in` | OFFICIAL_GOVERNMENT | 1 | `DOCUMENT_DOWNLOAD` | Historical papers (1995–2014) for CSE Prelims and Mains. Official public records. |
| **PIB_GOV_IN** | Press Information Bureau<br>`pib.gov.in` | OFFICIAL_GOVERNMENT | 1 | `INDEX_ONLY` | Official government press releases, policy announcements, and economic data. |
| **EXAMGOAL_ARCHIVE**| ExamGOAL UPSC PDF Archive<br>`pdf.questions.examgoal.com` | EDUCATIONAL_CORROBORATION | 2 | `DOCUMENT_DOWNLOAD` (Official PDFs Only) | Official past year question booklets with QR codes. **Proprietary solutions strictly excluded.** |
| **EXAMSIDE_PYQ** | ExamSIDE Questions Portal<br>`questions.examside.com` | EDUCATIONAL_CORROBORATION | 2 | `INDEX_ONLY` | Topic classification and syllabus categorization cross-checking. **Custom explanations strictly excluded.** |
| **UNLOCKIAS** | UnlockIAS UPSC Repository<br>`unlockias.in` | EDUCATIONAL_CORROBORATION | 2 | `INDEX_ONLY` | Multi-year topic distribution benchmarks. **Proprietary content strictly excluded.** |
| **IASBOARD** | IASBoard PYQ Platform<br>`iasboard.com` | EDUCATIONAL_CORROBORATION | 2 | `INDEX_ONLY` | Subject-wise categorization taxonomy. **Proprietary notes strictly excluded.** |
| **HUMAN_PERITUS** | Human Peritus CSAT Analysis<br>`humanperitus.com` | EDUCATIONAL_CORROBORATION | 2 | `INDEX_ONLY` | Public CSAT topic taxonomy. **All paid mock tests and course notes are strictly excluded.** |
| **DECODE_CIVILS** | Decode Civils Mains Resource<br>`decodecivils.com` | EDUCATIONAL_CORROBORATION | 2 | `INDEX_ONLY` | Mains syllabus micro-topic mappings. **Proprietary model answers strictly excluded.** |
| **NCERT_PORTAL** | NCERT Textbook Repository<br>`ncert.nic.in` | STATUTORY_PEDAGOGICAL | 3 | `METADATA_DEEP_LINK` | High-yield chapters mapped to GS syllabus under fair dealing for educational navigation. |
| **INDIA_CODE** | Legislative Department<br>`indiacode.nic.in` | STATUTORY_PEDAGOGICAL | 3 | `INDEX_ONLY` | Authoritative statutory texts, Constitutional Articles, and statutory amendments. |

---

## 3. Strict Legal & Content Guardrails

1. **Zero Intellectual Property Infringement:**
   - Under Section 52(1)(a) of the Indian Copyright Act (Fair Dealing) and public records principles, official question papers published by government examining bodies are public domain records.
   - **Derivative explanations, commercial question banks, and third-party solutions are protected by copyright.** Pravaah UPSC strictly NEVER copies or imports explanations from commercial coaching institutes (e.g. VisionIAS, InsightsIAS, ForumIAS, Human Peritus).
2. **Independent Pedagogical Explanations:**
   - Every explanation on Pravaah UPSC is independently authored by our academic editorial team, linking directly to primary constitutional provisions, statutory laws, or official government gazettes.
3. **No Paywall or Access Restriction Bypass:**
   - The platform never bypasses logins, CAPTCHAs, paywalls, or robot-restricted directories.
   - All external references are logged with `retrievedAt`, `sourceUrl`, and `sourceType`.
4. **Separation of Source Records & Derived Explanations:**
   - The database maintains `QuestionSource` and `SourceCitation` models separate from Pravaah's `Explanation` model, establishing full auditability.
