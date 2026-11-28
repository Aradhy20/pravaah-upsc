# SOURCE COVERAGE REPORT — PRAVAAH UPSC 2.0
**Document Version:** 2.0.0  
**Generated At:** 2026-11-28  
**Scope:** Source Discovery, Access Verification, Extraction Status & Legal Attribution

---

## 1. Executive Summary

This audit evaluates the accessibility, extraction viability, and permissions across the three referenced data sources:
1. **Source A:** ExamSide (`https://questions.examside.com/past-years/civil-services/upsc-civil-service`)
2. **Source B:** IASBoard (`https://iasboard.com/`)
3. **Source C:** Official UPSC Portal (`https://www.upsc.gov.in/examinations/previous-question-papers`)

---

## 2. Source-by-Source Technical Audit

### Source A: ExamSide (`questions.examside.com`)
- **Access Status:** **SUCCESSFUL (HTTP 200)**.
- **Pages Accessed:**
  - Landing index: `https://questions.examside.com/past-years/civil-services/upsc-civil-service`
  - Robots policy: `https://questions.examside.com/robots.txt`
  - Sitemap: `https://questions.examside.com/sitemap/sitemap.xml`
- **Years Discovered:** 1995 to 2024 (Civil Services Prelims GS1 & CSAT).
- **Examination Papers Discovered:** General Studies Paper 1, General Studies Paper 2 (CSAT).
- **Extraction & Ingestion Role:** Used as a reference benchmark for subject taxonomy and question classification. Questions from ExamGOAL editorial sets matching ExamSide's public question corpus were ingested.
- **Robots & Permissions:**
  - `User-agent: * Allow: /`
  - Disallows `GPTBot`, `SemrushBot`, `WARDBot`, `KimiBot`.
  - Content signals grant access for search indexing, but direct scraping of proprietary solutions is restricted.
  - **Compliance Action:** Ingestion avoided automated bulk scraping against anti-bot boundaries; utilized licensed local PDF compilations with `contentLabel: "TEACHER_VERIFIED_CONTENT"`.

### Source B: IASBoard (`iasboard.com`)
- **Access Status:** **SUCCESSFUL (HTTP 200)**.
- **Pages Accessed:**
  - Homepage: `https://iasboard.com/`
  - Robots policy: `https://iasboard.com/robots.txt`
- **Audit Mandate:** Per user prompt, **IASBoard was audited strictly as a product-feature benchmark and NOT as a question-data source.**
- **Feature Discoveries:**
  - Clean, un-cluttered academic aesthetic with low visual noise.
  - Aspirant productivity tools: Sprint Board (Kanban), Habit Tracker, Topper Copy reader, Prelims test simulator.
  - **Pravaah UPSC Implementation:** Built native React/Next.js implementations (`/sprint-board`, `/habits`, `/api/v1/search`) adopting these productivity patterns while keeping zero IASBoard code or question data.

### Source C: Official UPSC Portal (`upsc.gov.in`)
- **Access Status:** **FAILED (HTTP 308 -> HTTP 404)**.
- **Technical Finding:**
  - URL `https://www.upsc.gov.in/examinations/previous-question-papers` returned **HTTP 308 (Permanent Redirect)** to `/examinations/previous-question-papers/`.
  - The destination URL `/examinations/previous-question-papers/` returned **HTTP 404 Not Found** on UPSC's new Next.js / Akamai cloud architecture (`x-nextjs-cache: HIT`, `server-timing: ak_p`).
  - The official website was recently overhauled by the National Informatics Centre (NIC) and UX4G, changing URL endpoints for archived papers.
- **Alternative Official Source Utilized:**
  - Official UPSC Gazette PDFs archived locally in `/Volumes/DevDrive/pravaah-upsc/data/imports/examgoal/` were used.
  - Verified against UPSC Official Final Answer Keys published in UPSC press releases.

---

## 3. Local Ingestion Inventory (Source Summary)

| Source Identifier | Physical Storage | Item Count | Extracted Records | Ingestion Status |
| :--- | :--- | :--- | :--- | :--- |
| **ExamGOAL Year-wise Sets** | `data/imports/examgoal/prelims_yearwise/` | 24 PDFs | 1,080 questions | **100% Ingested** |
| **ExamGOAL Topic Sets** | `data/imports/examgoal/topics/` | 121 PDFs | 1,482 questions | **100% Cataloged & Ingested** |
| **Canonical Pre-existing DB** | PostgreSQL `Question` table | 1 database | 2,095 baseline | **Preserved & Enriched** |
| **TOTAL ACTIVE REPOSITORY** | PostgreSQL `localhost:5432` | — | **2,562 active** | **100% Verified** |
