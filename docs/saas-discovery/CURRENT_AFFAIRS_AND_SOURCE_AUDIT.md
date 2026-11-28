# PRAVAAH UPSC — CURRENT AFFAIRS & GOVERNMENT SOURCE AUDIT

**Audit Date:** November 28, 2026  
**Auditor:** Senior Data Ingestion Architect & Public Policy Intelligence Lead  
**Scope:** Evaluation of `CurrentAffairsStory` (56 Records), Automated Ingestion Pipelines, and 18 Registered Sources  
**Governance Standard:** Zero Copyright Infringement, Traceable Primary Sources, robots.txt Compliance  

---

## 1. Executive Summary: Current Affairs Reality in Database

Pravaah UPSC features a dedicated Current Affairs portal (`/current-affairs` and `/api/v1/current-affairs`) designed to provide daily news summaries with Prelims facts and Mains analytical angles.

### The Findings:
1. **Static Seeding, Not Dynamic Ingestion:** The database currently contains exactly **56 records in `CurrentAffairsStory`**. These were batch-seeded during early platform setup and have not updated since.
2. **Missing Publication Timestamps:** Query inspection shows that `sourceDate` is `null` on several records, causing dates to render as "Date Unknown" or blank on the frontend.
3. **No Active Production Cron Job:** While a cron handler exists at `app/api/v1/cron/daily-ingest/route.ts`, it is **not configured or triggered in `vercel.json`**. No background worker executes daily to harvest Press Information Bureau (PIB) or Reserve Bank of India (RBI) notifications.
4. **Weak Daily Quiz Linkage:** The Daily Quiz (`/daily-quiz`) pulls 5 static questions from the 121 published Prelims questions, rather than generating fresh dynamic questions based on today's current affairs.

---

## 2. Ingestion Pipeline & Script Inspection

The repository contains several experimental Python and Node scripts in `scripts/`:
- `scripts/daily_current_affairs_crawler.py` (22 KB): Experimental Python script intended to parse PIB and PRS RSS feeds. Uses `urllib` and `re`. Not integrated into Vercel production deployment.
- `scripts/ingest_current_affairs.py` (25 KB): Batch transformer parsing Markdown news files into database records.
- `app/api/v1/cron/daily-ingest/route.ts`: API route intended for Vercel Cron. Contains placeholder logic:
  ```typescript
  // Checks CRON_SECRET authorization header
  // Currently performs a static mock ping rather than a true scraper
  ```

---

## 3. Authoritative Primary Sources vs. Secondary Benchmarks

To maintain strict compliance with Indian copyright laws, fair dealing guidelines, and website Terms of Service, Pravaah maintains a strict two-tier source classification matrix:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AUTHORITATIVE SOURCE TAXONOMY                        │
├───────────────────────────────────┬────────────────────────────────────┤
│ Tier 1: Primary Official (Allowed)│ Tier 2: Supplementary (Restricted) │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Press Information Bureau (pib)  │ • Vision IAS / ForumIAS / Drishti  │
│ • Reserve Bank of India (rbi)     │   (STRICT PROHIBITION: Never scrape│
│ • PRS Legislative Research        │    proprietary compilations, mocks,│
│ • India Code (Acts & Amendments)  │    or commercial study material)   │
│ • Union Budget (indiabudget.gov)  │ • UnlockIAS / ExamSIDE / ExamGoal  │
│ • ISRO & MoEFCC Official Portals  │   (Restricted to taxonomy review & │
│ • Supreme Court Landmark Judgments│    question stem verification only)│
└───────────────────────────────────┴────────────────────────────────────┘
```

### Legal & Rate-Limiting Protocols (`SourceRegistryRecord`):
- **Robots.txt & Terms Adherence:** Automated crawlers must respect robots.txt restrictions. A polite minimum delay of 2.0 seconds is enforced across all HTTP calls.
- **Fair Dealing Exemption:** Official public notifications, press releases, gazettes, and legislative bills are public domain government records under Section 52(1)(q) of the Indian Copyright Act, 1957. Summaries and academic questions derived from them are legally protected.
- **Zero Third-Party Scraping:** Commercial coaching compilations must never be mirrored or ingested.

---

## 4. Architectural Requirements for Live Production Current Affairs

To transform the current affairs section from a static showcase into a dependable daily engine, four architectural components must be implemented:

```
[1. Daily Government Harvester] (Vercel Cron / GitHub Action running at 06:00 IST)
             │
             ▼ (Fetches daily press releases from PIB Delhi, PRS Bill Track, RBI Notifications)
[2. Academic Syllabus Filter]
             │ (Matches ministry releases to GS1, GS2, GS3 syllabus nodes; drops trivial items)
             ▼
[3. Structured Ingestion Pipeline]
             │ (Extracts: Title, Summary, Prelims Fact Box, Mains Analytical Angle, Source URL)
             ▼
[4. Daily Quiz Auto-Generator]
               (Generates 5 conceptual daily check questions grounded in the morning's news)
```

### Acceptance Criteria for Current Affairs Launch:
1. Every story must feature an authoritative `sourceUrl` (e.g. `https://pib.gov.in/PressReleasePage.aspx?PRID=...`) and valid `sourceDate`.
2. Automatic archiving of stories older than 12 months into historical revision folders.
3. Monthly PDF compilation export generator for offline student revision.
