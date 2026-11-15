# Pravaah UPSC — Historical PYQ, NCERT & Government Examination Data Acquisition Audit

**Audit Date**: November 2026  
**Platform**: Pravaah UPSC ([https://pravaah-upsc.vercel.app](https://pravaah-upsc.vercel.app))  
**Database**: PostgreSQL on Neon  
**Document Code**: `DOC-ACQ-AUDIT-01`  

---

## 1. Executive Summary

This audit assesses the current state of examination questions, NCERT textbook integration, and historical coverage in Pravaah UPSC. 

While the platform has verified question sets for UPSC CSE Prelims from **2019 to 2024** (1,079 published questions with detailed explanations), the current question bank has major gaps that prevent it from being a comprehensive historical UPSC examination and NCERT knowledge platform.

This document identifies those gaps, analyzes source repositories, establishes legal and copyright guardrails (especially regarding NCERT), and outlines the engineering architecture for an automated, verified data acquisition engine.

---

## 2. Current Database Inventory & Statistics

A live audit of the Neon PostgreSQL database yields the following exact metrics:

| Entity | Current DB Count | Status / Coverage |
|---|---|---|
| **Total Prelims Questions** | 1,108 (1,079 Published) | Covers **only 2019–2024** (6 years) |
| **Questions per Year** | 2019 (180), 2020 (180), 2021 (180), 2022 (180), 2023 (180), 2024 (208) | Balanced GS1 + CSAT for 2019–2024 |
| **CSE Mains Questions** | 80 questions | Sample coverage across GS1 (20), GS2 (19), GS3 (19), GS4 (18), Essay (4) |
| **Exam Profiles** | 8 profiles in `ExamDirectory` | Directory metadata only for CSE, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO |
| **Questions for Other Exams** | **0** | No question records in DB for NDA, CDS, CAPF, EPFO, or ESE |
| **NCERT Books Indexed** | **0** | No Prisma model or table currently exists for NCERT books |
| **NCERT Chapters Indexed** | **0** | No chapter metadata, syllabus links, or textbook references exist |
| **Syllabus Micro-Topics** | 53 nodes | Seeded in `SyllabusNode` across GS1, CSAT, Mains GS1-4, Essay |
| **Current Affairs Dossiers** | 56 stories | PIB & Ministry verified stories linked to syllabus and historical PYQs |
| **Daily Quizzes** | 38 quizzes (163 questions) | 5-question daily Prelims diagnostic archive |
| **Source Documents Tracked** | 37 records | Source PDF hashes for 2019–2024 papers |

---

## 3. Gap Analysis: Missing Years, Papers & Examinations

### Gap A: Modern UPSC CSE Prelims (2011 – 2018)
- **Status**: Completely Missing in database.
- **Background**: In 2011, UPSC overhauled the Preliminary Examination pattern, replacing the optional subject paper with **General Studies Paper I (100 Qs, 200 marks)** and **CSAT Paper II (80 Qs, 200 marks)**.
- **Requirement**: Acquire, extract, verify, and index all 8 years (2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018) = **~1,440 questions**.

### Gap B: Historical UPSC CSE Prelims (1979 – 2010)
- **Status**: Completely Missing in database.
- **Background**: The 3-stage Civil Services Examination pattern was formally introduced in **1979** following the Kothari Commission recommendations. From 1979 to 2010, the Prelims consisted of a Compulsory General Studies paper and one Optional Subject paper (out of 23 optional subjects).
- **Requirement**:
  - Distinguish historical papers with their actual exam structure rather than forcing modern 2015 qualifying rules on them.
  - Ingest available historical General Studies papers from official UPSC archives and parliamentary digital archives.
  - Tag unavailable or non-digitized years explicitly as `UNAVAILABLE_HISTORICAL` rather than fabricating synthetic questions.

### Gap C: UPSC CSE Mains Complete Papers & Optionals
- **Status**: Partially covered (only 80 sample questions).
- **Requirement**:
  - Ingest full GS Paper I, II, III, IV, and Essay papers from **2013 to 2024** (the post-2013 Mains pattern).
  - Add optional subject question repositories (History, Geography, PSIR, Public Administration, Sociology, Anthropology).
  - Tag compulsory language papers (English and 8th Schedule Indian Languages).

### Gap D: Other UPSC Central Examinations
- **Status**: 0 questions currently in database.
- **Requirement**:
  - The database and UI must provide dedicated categories for other UPSC examinations:
    1. **CDS** (Combined Defence Services — Elementary Maths, English, General Knowledge)
    2. **NDA & NA** (National Defence Academy — Mathematics, General Ability Test)
    3. **CAPF (AC)** (Central Armed Police Forces Assistant Commandants — Paper 1 General Ability, Paper 2 General Studies & Essay)
    4. **EPFO** (Enforcement Officer / APFC — Labour Laws, Accounting, Social Security, General Studies)
  - Keep non-CSE examinations completely isolated in filters and test generators.

### Gap E: Complete NCERT Knowledge Base (Classes 6 – 12)
- **Status**: Completely missing from schema and data layers.
- **Requirement**:
  - Index Class 6 to 12 textbooks for History, Geography, Political Science, Economics, Science & Technology, Sociology, and Environment.
  - Capture Class, Subject, Book title, Chapter number, Chapter title, key syllabus topics, and official textbook reading links (`ncert.nic.in` & `epathshala.nic.in`).
  - Create a relational bridge between NCERT chapters and the UPSC PYQs that test those concepts.

---

## 4. Legal & Copyright Architecture for NCERT

> [!CAUTION]
> **NCERT Commercial Redistribution Prohibition**:
> NCERT explicitly asserts copyright over its textbooks under the Copyright Act, 1957. While educational use and public reading through `ncert.nic.in` and `epathshala.nic.in` are permitted, **incorporating raw textbook PDF files or verbatim multi-page extracts into a commercial, paid SaaS platform is legally prohibited without a license**.

### Compliant Legal Architecture Implemented:
1. **Metadata & Deep-Linking Only**: The SaaS stores book titles, classes, chapter numbers, chapter titles, key syllabus concepts, and **canonical outbound links directly to official NCERT and ePathshala web portals**.
2. **Original Pedagogical Summaries**: Any high-yield summary notes provided inside the SaaS are independently authored educational syntheses with strict citations.
3. **Traceable Attribution**: Every NCERT record maintains an immutable `copyrightNotice` acknowledging the National Council of Educational Research and Training (NCERT), New Delhi.
4. **No Raw PDF Re-Hosting**: The platform does not host unauthorized copies of NCERT textbooks.

---

## 5. Official Source Hierarchy & Priority Registry

```
+-----------------------------------------------------------------------------------+
|                        AUTHORITATIVE ACQUISITION PIPELINE                         |
+-----------------------------------------------------------------------------------+

[TIER 1: OFFICIAL GOVERNMENT SOURCES (100% GROUND TRUTH)]
  - UPSC Previous Question Papers: https://www.upsc.gov.in/examinations/previous-question-papers
  - UPSC Archival Repository: https://www.upsc.gov.in/examinations/previous-question-papers/archives
  - UPSC CMS Document Registry: https://cms.upsc.gov.in/previous-exam-details/
  - NCERT Textbook Portal: https://ncert.nic.in/textbook.php
  - ePathshala National Repository: https://epathshala.nic.in/
  - Press Information Bureau (PIB): https://pib.gov.in/
  - Digital Sansad (Parliament Archives): https://eparlib.sansad.in/

[TIER 2: TRUSTED EDUCATIONAL SOURCES (CORROBORATION & EXPLANATIONS)]
  - Vision IAS, InsightsIAS, Drishti IAS, ForumIAS, ClearIAS, IASbaba
  - Role: Answer key cross-checking, explanation references, subject classifications
  - Constraint: Strictly adhere to robots.txt and terms of service; no unauthorized scraping

[TIER 3: AUTOMATED SEARCH & DISCOVERY ENGINE]
  - Search discovery via authorized APIs (Bing / Google Custom Search)
  - Targets verified PDF URLs and official archival records
  - Constraint: Strict content hash validation; search snippets are NEVER imported as questions
```

---

## 6. Implementation Roadmap

1. **Phase 1: Project Audit & Data Ingestion Specs** *(Completed in this document)*.
2. **Phase 2: Database Schema Expansion**:
   - Add `NCERTBook`, `NCERTChapter`, `NCERTChapterQuestionLink`, `SourceRegistryRecord`, `ExtractionJob`, and `DataQualityReport` models in Prisma.
   - Deploy to Neon PostgreSQL with `npx prisma db push`.
3. **Phase 3: Source Registry Seeding**:
   - Deploy comprehensive registry of official and educational endpoints with licensing terms.
4. **Phase 4: NCERT Knowledge Base Construction**:
   - Seed 150+ Class 6–12 chapters across 7 core disciplines with official portal deep links.
5. **Phase 5: Historical Question Ingestion & Classification**:
   - Ingest modern era 2011–2018 CSE Prelims papers with official answer keys.
   - Ingest representative papers for NDA, CDS, CAPF, and EPFO.
   - Run AI-assisted subject, topic, and NCERT chapter classification.
6. **Phase 6: Student NCERT Hub & Admin Ingestion UI**:
   - Build `/ncert` interactive student portal linking textbooks to historical PYQs.
   - Build `/admin/ingestion` dashboard for pipeline observability.
7. **Phase 7: Full 15-Document Specification Suite**:
   - Generate all operational runbooks, schema specifications, and verified DB counts.
