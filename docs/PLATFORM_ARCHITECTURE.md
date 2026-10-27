# Pravaah UPSC — Platform Architecture & Systems Design

## 1. Executive Architecture Summary
Pravaah UPSC is engineered as a high-performance, mobile-first intelligence and learning platform for civil services aspirants. It is structured around the principle that effective preparation requires answering three questions daily:
1. **What to study today?** (Curated Current Affairs from official releases + high-yield syllabus modules).
2. **What is important for UPSC?** (Historical question papers connected to the current themes with official answer keys).
3. **What to revise next?** (Algorithmic spaced repetition driven by mistake tracking).

---

## 2. System Architecture Diagram

```
                 +--------------------------------------------------+
                 |              ASPIRANTS / BROWSERS                |
                 |      Mobile Phones (PWA) / Tablets / Desktops    |
                 +------------------------+-------------------------+
                                          |
                                 HTTPS / Next.js SSR
                                          |
                 +------------------------v-------------------------+
                 |            NEXT.JS 14 APP ROUTER                 |
                 |                                                  |
                 |  [Client Components]       [Server API Routes]   |
                 |  - Header / Nav            - /api/v1/auth/*      |
                 |  - Study Planner UI        - /api/v1/questions/* |
                 |  - Current Affairs UI      - /api/v1/exams/*     |
                 |  - Daily Quiz UI           - /api/v1/mains/*     |
                 |  - Mains Workspace         - /api/v1/quiz/*      |
                 |  - PYQ Explorer & Timed    - /api/v1/billing/*   |
                 +------------------------+-------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
           Prisma ORM (v5.22)                       Authentication & RBAC
                      |                             (Cookie / Token Isolated)
                      v                                       |
    +-----------------------------------+                     v
    |        PRIMARY DATABASE           |          +--------------------+
    |   PostgreSQL (Prod) / SQLite (Dev)|          | Entitlement Engine |
    |   - 1,085+ Verified Questions     |          | (Free/Beginner/    |
    |   - Multi-Exam Directory (8 Exams)|          |  Achiever/Scholar) |
    |   - Current Affairs & Quizzes     |          +--------------------+
    |   - ReviewSchedule (SM-2 Spaced)  |
    +-----------------+-----------------+
                      ^
                      |
    +-----------------+-----------------+
    |   AUTOMATED BACKGROUND WORKERS    |
    | - daily_current_affairs_crawler.py|
    | - audit_sources.py                |
    | - discover_upsc_papers.py         |
    +-----------------------------------+
```

---

## 3. Core Subsystems

### A. Question Bank Engine (1,085+ Questions)
- **Authenticity Gate:** 1,079 published questions across 6 continuous Prelims exam cycles (2019-2024: 605 GS1 + 480 CSAT).
- **Anti-Leak Defense:** When test sessions are initialized, options are provided with randomized codes, and `isCorrect` fields are stripped until server-side submission.
- **Scoring Engine:** Negative marking strictly configured: GS1 (+2.0, -0.666), CSAT (+2.5, -0.833).

### B. Current Affairs & PYQ Linking Pipeline
- Ingests permitted press releases from official authorities (PIB, RBI, Ministries, PRS).
- Classifies stories into GS Papers (GS1-GS4) and syllabus sub-themes.
- Searches the question bank to establish bidirectional links between current events and historical UPSC questions.
- Generates a daily 5-question Prelims practice quiz with explanations.

### C. Multi-Exam Directory
- Unified catalogue covering 8 premier UPSC examinations: CSE, IFS, CDS, NDA, CAPF-AC, ESE (IES), CMS, and EPFO.
- Authoritative details on eligibility, qualifications, age limits, permissible attempts, examination stages, and official notification links.

### D. Mains Answer-Writing Workspace
- Supports GS1, GS2, GS3, GS4, and Essay questions.
- Timed practice mode, live word counter, structure audit checklist (Intro, Body Dimensions, Case Studies, Way Forward), and self-evaluation scoring rubric.

### E. Spaced-Repetition Revision Hub
- Built on the SuperMemo-2 (SM-2) memory retention algorithm.
- Tracks failed attempts in Learn Mode, Timed Mock Tests, and Daily Quizzes, scheduling subsequent reviews at intervals of 1, 3, 7, 14, and 30 days.
