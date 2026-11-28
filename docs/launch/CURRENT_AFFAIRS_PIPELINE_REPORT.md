# Pravaah UPSC — Current Affairs Pipeline Report
**Date:** 28 November 2026  
**Domain:** UPSC Civil Services Current Affairs Engine & PYQ Concept Linker  

---

## 1. Current Affairs Architecture

The Pravaah UPSC Current Affairs Engine connects contemporary news events directly to foundational static syllabus topics and historical examination questions (1995–2024).

```
[Contemporary News Event]
          │
          ├──> [GS Paper & Syllabus Micro-Theme Assignment]
          │       (e.g., Article 200 Governor Assent -> Polity / Union & State Executive)
          │
          ├──> [Connected Historical PYQ Linking]
          │       (e.g., Links to UPSC CSE Prelims 2014 & 2023 questions on Governor's Discretion)
          │
          └──> [Preliminary Micro-Quiz Generation]
                  (5-question daily quiz testing underlying static concept)
```

---

## 2. Pipeline Readiness & Controlled Beta Status

- **Corpus:** 56 comprehensive curated current affairs packages covering GS1, GS2, GS3, and GS4 themes.
- **Connected PYQs:** Every current affairs article links to at least 1 authentic past-year examination question to emphasize the static-dynamic continuum.
- **Automated Crawling Posture:** Ingestion scrapers (`scripts/daily_current_affairs_crawler.py`) require human-in-the-loop faculty review before publication to ensure no unverified sensationalist media enters the academic catalog.
