# UPSC Source Registry & Domain Health Audit

## 1. Registry Overview

The Pravaah UPSC Ingestion Operations Engine maintains an authoritative, audited registry of official government repositories, educational portals, and legislative archives. Automated scraping adheres strictly to robots.txt allowances, rate limiting, and ethical collection protocols.

Total Monitored Sources: **27 Sources**  
Automated Ingestion Allowed: **8 Sources** (PIB RSS, Official Question PDF Downloads, Digital Sansad Archives)  
Metadata & Indexing Only: **19 Sources** (NCERT textbook navigation, ePathshala portals, educational commentary)

---

## 2. Priority 1: Official Government Repositories (Highest Authority)

| Source ID | Name | Canonical URL | Method | Allowed Policy | Status |
|:---|:---|:---|:---|:---|:---|
| `upsc-official-papers` | UPSC Previous Question Papers | `https://upsc.gov.in/examinations/previous-question-papers` | Direct Document Download | Allowed (Public Domain Notices) | HTTP 200 (Active) |
| `upsc-archives` | UPSC Question Paper Archives | `https://upsc.gov.in/examinations/previous-question-papers/archives` | Direct Document Download | Allowed | HTTP 200 (Active) |
| `ncert-official` | NCERT Official Textbook Portal | `https://ncert.nic.in/textbook.php` | Metadata & Deep Link Only | **No PDF re-hosting** | HTTP 200 (Active) |
| `ncert-epathshala` | ePathshala Portal | `https://epathshala.nic.in` | Deep Link & Syllabus Catalog | Fair Dealing Navigation | HTTP 200 (Active) |
| `pib-gov` | Press Information Bureau (PIB) | `https://www.pib.gov.in` | RSS Feed & Document Extract | Allowed (Creative Commons / Open Gov) | HTTP 200 (Active) |
| `digital-sansad` | Digital Sansad (Parliament Archives) | `https://eparlib.sansad.in` | Metadata & Transcript Lookup | Allowed (Public Record) | HTTP 200 (Active) |

---

## 3. Priority 2: Secondary Educational Portals (Explanations & Subject Classifications)

| Source ID | Entity | Coverage Area | Usage Constraint |
|:---|:---|:---|:---|
| `vision-ias-pyq` | Vision IAS | Answer explanations & Mains value-adds | Pedagogical cross-check only; synthesized into original Pravaah explanations |
| `insights-ias` | Insights on India | Static Prelims subject analysis & daily quizzes | Topic tagging cross-verification |
| `drishti-ias` | Drishti IAS | Hindi/English terminology & historical trends | Bilingual validation |
| `forum-ias` | ForumIAS | Community disputes on ambiguous Series A questions | Tracking official key corrections vs coaching disputes |

---

## 4. Crawling & Rate-Limitation Constraints

1. **User-Agent Header**: `PravaahUPSC-Bot/2.0 (+https://pravaah-upsc.vercel.app/bot-policy; bot@pravaah.in)`
2. **Rate Limit**: Maximum 1 request per 3.0 seconds for `.gov.in` domains; maximum 1 request per 2.0 seconds for educational blogs.
3. **WAF & DDoS Safeguards**: Automatic backoff with jitter on HTTP 429/503 responses (`exponential_backoff_with_jitter` max 5 retries).
4. **Zero Bypass Rule**: No CAPTCHA solvers, proxy rotators, or unauthorized scrapers are permitted.
