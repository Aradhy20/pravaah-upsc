# Pravaah UPSC — Phase 5: Mission Control Specification & Architecture

**Route:** `/mission-control`  
**API Endpoint:** `/api/v1/mission-control`  
**Lead Architect:** Principal SaaS Architect & UPSC EdTech Specialist  
**Status:** Implemented & Verified  
**Design System Standards:** 72px Navbar, 8pt spatial grid, `#2453E6` brand primary, `#101828` navy heading, `#F7F9FC` surface, `#E4E7EC` border

---

## 1. Executive Overview

**Pravaah Mission Control** (`/mission-control`) is the authoritative daily preparation command center for UPSC Civil Services aspirants. It consolidates scattered practice data into an actionable learning loop designed around the daily aspirant journey:
$$\text{Read} \longrightarrow \text{Understand} \longrightarrow \text{Practice} \longrightarrow \text{Revise} \longrightarrow \text{Test} \longrightarrow \text{Master}$$

All metrics, graphs, and indicators displayed in Mission Control are derived strictly from authentic PostgreSQL tables (`UserAttempt`, `ReviewSchedule`, `UserTopicProgress`, `UserMistakeClassification`, `TestSession`, `MainsDraft`). Pravaah never shows synthetic or fabricated performance scores.

---

## 2. The 5 Core Aspirant Questions

Mission Control explicitly answers the five fundamental questions every UPSC aspirant asks daily:

### 1. What should I study today?
- **Data Inputs:** `UserProfile.dailyStudyHours`, pending SM-2 revision count, active weak topics, today's diagnostic quiz status.
- **Output:** Structured daily timetable with estimated task durations and interactive checkboxes for completion tracking.

### 2. Which subjects are my weaknesses?
- **Data Inputs:** Grouped query on `UserAttempt` where `accuracy < 60%` with at least 1 attempt, cross-referenced with `UserMistakeClassification`.
- **Output:** Prioritized list of friction points (topic, subject, attempt count, accuracy percentage) with a direct "Drill" shortcut.

### 3. What should I revise?
- **Data Inputs:** `ReviewSchedule` where `nextReviewAt <= now()` (SuperMemo-2 algorithm) and unresolved mistake notebook items.
- **Output:** Actionable count of due flashcards and mistake questions with a one-click launcher into `/revision`.

### 4. How am I improving?
- **Data Inputs:** Historical `UserAttempt` timeline, correct vs. incorrect breakdown, average response times.
- **Output:** Comprehensive accuracy percentage, question volume benchmarks, and subject status tags (Strong, Improving, Needs Revision, Weak, Insufficient Data).

### 5. Am I prepared for the examination?
- **Data Inputs:** Transparent multi-factor Exam Readiness Index.
- **Output:** Composite readiness gauge (0–100) with detailed component contributions and qualitative stage positioning without deceptive rank predictions.

---

## 3. Mathematical Telemetry Specifications

### 3.1 Exam Readiness Index Formula
$$\text{Readiness Index} = (0.35 \times \text{GS1 Accuracy}) + (0.25 \times \text{CSAT Benchmark Score}) + (0.20 \times \text{Syllabus Coverage}) + (0.20 \times \text{Revision Consistency})$$

Where:
- $\text{GS1 Accuracy} = \frac{\text{Correct GS1 Attempts}}{\text{Total GS1 Attempts}} \times 100$
- $\text{CSAT Benchmark Score} = \min\left(100, \frac{\text{Estimated CSAT Score}}{66} \times 100\right)$ (where $66/200$ marks is the official $33\%$ qualifying mark)
- $\text{Syllabus Coverage} = \frac{\text{Mastered Topics} + 0.5 \times \text{In Progress Topics}}{53 \text{ Micro-topics}} \times 100$
- $\text{Revision Consistency} = \frac{\text{Completed Reviews}}{\text{Total Scheduled Reviews}} \times 100$

### 3.2 Subject Status Classification Criteria
- **STRONG:** Accuracy $\ge 75\%$ with $\ge 3$ attempts.
- **IMPROVING:** Accuracy $60\% - 74\%$ with $\ge 3$ attempts.
- **NEEDS REVISION:** Accuracy $40\% - 59\%$ with $\ge 3$ attempts.
- **WEAK:** Accuracy $< 40\%$ with $\ge 3$ attempts.
- **INSUFFICIENT DATA:** Fewer than 3 attempts in that subject pillar.

---

## 4. UI/UX Architecture & Layout Sections

1. **Header & Context Bar:**
   - Aspirant name, target exam year badge (2025/2026/2027), stage badge.
   - Live consecutive preparation streak badge (`🔥 3 Day Streak`).
   - Compact Language Switcher (`EN / हिंदी`) and instant data refresh.
2. **Interactive 5 Core Questions Banner:**
   - Horizontal tab selector switching between the 5 questions with icon indicators.
   - Dynamic recommendation card citing specific database-derived performance metrics.
3. **Today's Study Plan & Timetable:**
   - 4-task daily timetable (Diagnostic, Subject Practice, CSAT, Revision).
   - Interactive local storage checkboxes and real-time completion percentage.
4. **Exam Readiness Gauge & Methodology Callout:**
   - 100-point radial gauge, qualitative assessment, 4-factor breakdown table.
5. **CSAT Survival Coach Indicator:**
   - Live qualifying progress bar against the mandatory 66-mark (33%) threshold.
   - Sub-pillar accuracy for Quantitative Aptitude, Logical Reasoning, and Reading Comprehension.
6. **Weak-Topic Radar:**
   - High-friction topic cards with direct drill links to the PYQ catalog.
7. **Subject Mastery Matrix:**
   - Progress bars across Polity, Economy, Environment, History, Geography, Sci-Tech, and CSAT.
8. **Syllabus Intelligence & Mains Studio Velocity:**
   - Micro-topic mastery counts linking to `/syllabus/intelligence`.
   - Mains answer writing word count, drafts, and evaluation velocity.
9. **Strategic Recommended Next Actions:**
   - 3 prioritized action cards guiding the aspirant to high-impact interventions.

---

## 5. Security & Isolation

- **Endpoint:** `GET /api/v1/mission-control` strictly parses session token from request cookies.
- **User Isolation:** All database queries are locked to `userId = session.user.id`.
- **Unauthenticated Fallback:** Returns clean zero/calibration telemetry with `authenticated: false` flag, preventing any data leaks or 500 errors for anonymous visitors.
