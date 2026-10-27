# Pravaah UPSC — Automated Daily Current Affairs Pipeline

## 1. Pipeline Overview
The Daily Current Affairs Pipeline operates as an automated, scheduled ingest-classify-link workflow designed to connect breaking national policy developments with historical examination patterns.

```
+-------------------------------------------------------------+
| 1. MONITORING & DISCOVERY                                   |
| - PIB Releases (Press Information Bureau)                   |
| - Reserve Bank of India Notifications & Monetary Reports    |
| - PRS Legislative Summaries & Supreme Court Judgments       |
| - Ministry of Environment (MoEFCC) Ramsar/Forest Notices    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. PARSING & TAXONOMY CLASSIFICATION                        |
| - Headline, Source URL, Publication Date Extraction         |
| - GS Syllabus Mapping: GS1 (History/Geo), GS2 (Polity/IR),  |
|   GS3 (Economy/Ecology/Tech), GS4 (Ethics)                  |
| - Extraction of Key Terms & Institutional Entities          |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. QUESTION BANK CONNECTION (PYQ LINKING)                   |
| - Query 1,085+ Question Bank using entity/theme fingerprints|
| - Establish StoryQuestionLink with pedagogical rationale    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 4. DAILY PRACTICE QUIZ GENERATION                           |
| - 5 Original UPSC-style Prelims MCQs                        |
| - 4 Options with Series A Alignment & Core Explanations     |
| - Added to DailyQuiz and DailyQuizQuestion tables           |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 5. EDITORIAL REVIEW & PUBLICATION                           |
| - Status: PUBLISHED or FACT_CHECK_REQUIRED                  |
| - Live sync to /current-affairs, /daily-quiz, and planner   |
+-------------------------------------------------------------+
```

---

## 2. Source Policies & Permissible Collection
1. **Official Sources Only:** All news cards originate from public government and statutory releases.
2. **Attribution Guarantee:** Every published card displays canonical publisher, original publication date, and direct external link.
3. **No Third-Party Scraping:** Pravaah does not scrape proprietary analysis or paid editorials of competing education websites.

---

## 3. Scheduled Worker CLI
To run an on-demand crawl and sync:
```bash
python3 scripts/daily_current_affairs_crawler.py
```
This logs duration, stories created, PYQs linked, and quiz questions generated to `BackgroundJob` table.
