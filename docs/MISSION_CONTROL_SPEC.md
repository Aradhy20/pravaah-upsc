# PRAVAAH UPSC — MISSION CONTROL SPECIFICATION

**Route:** `/mission-control`  
**API Endpoint:** `/api/v1/mission-control`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Architecture:** Next.js Server Components + Revalidated Client Widgets + Prisma PostgreSQL

---

## 1. Product Vision & The 5 Core Daily Answers

UPSC aspirants often suffer from cognitive overload, anxiety, and aimless study habits. Pravaah Mission Control is designed as a high-density, low-friction executive dashboard that answers the five vital questions every morning:

1. **What should I study today?**  
   - Generated dynamically based on syllabus micro-node priorities and high-yield UPSC weightage.
2. **Which subjects are my weaknesses?**  
   - Calculated via empirical error logs from the Mistake Intelligence Lab.
3. **Which questions should I practise?**  
   - Recommended test drills targeting unattempted PYQs and weak topics.
4. **What should I revise today?**  
   - Computed via the SuperMemo-2 (SM-2) spaced repetition engine.
5. **Am I prepared for the examination?**  
   - Reflected in real-time through the multi-factor **Prelims Readiness Index (0–100)**.

---

## 2. Data Flow & Architecture

```
[ Aspirant Browser: /mission-control ]
               │
               ▼ HTTP GET
[ API Route: /api/v1/mission-control ]
               │
   ┌───────────┴─────────────────────────────────────────┐
   ▼                                                     ▼
[ User Authentication & Profile ]        [ Prisma Aggregations ]
- User Session                           - Completed Tests (TestSession)
- Target Year & Optional Subject         - Question Bank Stats
- Language Preference (EN / HI)          - ReviewSchedule (SM-2 Due Items)
                                         - UserMistake Table (Mistake Types)
                                         - TopicMastery Table (Syllabus %)
   │                                                     │
   └───────────┬─────────────────────────────────────────┘
               ▼
[ Telemetry Compute Engine ]
- Dynamic Readiness Score (0-100)
- Due Revisions Count (nextReviewDate <= now)
- Weakest Subject & Accuracy Delta
- Curated Daily Task Checklist
               │
               ▼ JSON Response
[ Mission Control UI Canvas ]
- Live Telemetry Row
- Spaced Repetition Due Tray
- Weak Area Alert Bar
- Interactive Daily Target Checklist
```

---

## 3. UI Component Breakdown

### 1. Header & Quick Telemetry Bar
- **Countdown to Prelims:** Days remaining to the upcoming UPSC Prelims Sunday.
- **Prelims Readiness Index:** Visual radial gauge (0 to 100) with rating badge (`Foundational`, `Emerging`, `Competitive`, `Exam Ready`).
- **Due Revisions Badge:** Number of flashcard/question reviews due today.
- **Accuracy Metric:** Overall 30-day rolling accuracy percentage.

### 2. "Focus Today" Executive Card
- Highlights the specific high-yield syllabus micro-node recommended for the day (e.g., *Polity — Constitutional Bodies: Election Commission vs CAG*).
- One-click CTA: `Start 15-Minute Drill` pointing directly to filtered practice questions.

### 3. Spaced Repetition Queue (`ReviewSchedule`)
- Displays items that have matured based on the SM-2 scheduling algorithm.
- Displays question stem snippet, lapse count, and last review date.
- Actions: Review Now, Snooze 1 Day.

### 4. Weakness Diagnostic Radar
- Identifies the subject with accuracy below 50% over the last 15 attempts.
- Classifies errors into primary cognitive traps: *Conceptual Gap*, *Factual Confusion*, *Silly Mistake*.

### 5. Daily Task Checklist (Persistent State)
- 4 daily non-negotiables:
  1. Complete 15 Prelims PYQs
  2. Review Due SM-2 Flashcards
  3. Read Daily Current Affairs Linkage
  4. Write 1 Mains GS Answer / Essay Outline
