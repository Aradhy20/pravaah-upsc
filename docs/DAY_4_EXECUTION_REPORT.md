# PRAVAAH UPSC — Day 4 Execution Report
## Personal Aspirant Dashboard, Personal Study Workspace & Learning Analytics

**Sprint Cycle:** Seven-Day Beta Launch Sprint (Day 4)  
**Execution Date:** November 1, 2026  
**Document Status:** **COMPLETED & FULLY VERIFIED**  
**Target Environment:** Vercel Production + Neon Serverless PostgreSQL  
**Author:** Senior Full-Stack Engineer, Product Architect & Production QA Lead  

---

## 1. Executive Summary

Day 4 of the Seven-Day Pravaah UPSC Launch Sprint has been completed with 100% adherence to all project safety rules, zero data loss, zero destructive migrations, and full verification against live Neon PostgreSQL database records.

We have delivered an authentic, personalized study workspace and performance analytics dashboard for UPSC civil services aspirants:
1. **Personal Aspirant Dashboard (`/dashboard`)**: Connected to real authenticated attempts, timed examinations, and profile targets. Features include welcome banner with target exam year, dynamic preparation stage, today's study minutes vs. daily goal progress bar, weekly 7-day study activity chart, GS Paper 1 vs. CSAT accuracy comparison, syllabus coverage tracking (1,079 published PYQs), priority weak and strong topics, mock exam score progression, and quick workspace shortcuts.
2. **Personal Study Planner & Task Workspace (`/study-planner`)**: Full study task management across Daily, Weekly, and Monthly horizons. Users can create, schedule, prioritize, complete, edit, and delete study sessions across 9 UPSC subjects (Polity, History, Geography, Economy, Environment, Science & Tech, CSAT, Current Affairs, Mains Answer Writing). Features overdue tracking, planned vs. actual study time calculation, and seamless integration with the 3-Pillar Daily Compass and Spaced Repetition queue.
3. **Personal Study Notes Workspace (`/notes`)**: Rebuilt with full-text search, subject filtering, inline note editing with save controls, delete confirmation modals, private user scoping, and one-click navigation to view the referenced question in the PYQ Explorer.
4. **Enhanced Bookmarks Explorer (`/bookmarks`)**: Multi-dimensional filtering by Subject, Year (2019–2024), and Paper (GS1 vs. CSAT), real-time search query matching, question count indicators, removal confirmation dialogs, and direct link to open the question in the PYQ Explorer.
5. **Target Profile Preferences (`/api/v1/user/profile`)**: Self-serve API and modal dialog allowing aspirants to customize their target UPSC exam year (2025–2028), daily study goal duration (minutes/hours), and optional subject.
6. **Strict Cross-User Tenant Isolation**: Every query and mutation is strictly authenticated and validated against the requesting user's ID. Cross-user modification and deletion attacks return HTTP 404/403.
7. **Regression and Production Build**: 6/6 dedicated Day 4 automated tests passed (100%). Clean Next.js 14 production build (`npm run build`) compiled 33/33 routes with zero TypeScript or linting errors.

---

## 2. Features Implemented & Enhanced

### A. Personal Aspirant Dashboard (`/dashboard`)
* **Welcome & Overview Banner**: Displays aspirant full name, target examination year badge (e.g. `UPSC CSE 2027`), optional subject tag, and dynamic preparation stage (`Prelims Foundation & PYQ Orientation`, `Subject Consolidation & PYQ Mastery`, or `Advanced Mock Simulation & Spaced Revision`).
* **Today's Study Progress**: Live minutes studied today vs. daily goal target with a progress bar and completion percentage.
* **Weekly Target Completion**: Total hours studied across the last 7 days vs. weekly target hours with progress indicator.
* **Net Accuracy Ribbon**: Overall historical accuracy percentage with correct vs. mistake count breakdown.
* **PYQ Bank Coverage**: Unique questions attempted out of 1,079 published Prelims questions, remaining questions count, and overall coverage percentage.
* **7-Day Activity Visualization**: Visual daily bar chart displaying questions attempted and study minutes for each of the past 7 days with hover indicators and today's highlight.
* **GS Paper 1 vs. CSAT Breakdown**: Side-by-side performance comparison showing attempted, correct, mistakes, and accuracy percentages for GS1 and CSAT Paper 2.
* **Subject Mastery Progress**: Comprehensive breakdown across all attempted subjects with color-coded benchmark progress bars (&ge; 70% emerald, 50–69% blue, &lt; 50% rose).
* **Strengths & Weaknesses Intelligence**: Identifies top weak topics (&lt; 60% accuracy) with direct "Drill this topic" links to `/pyqs`, and highlights top strong topics (&ge; 70% accuracy).
* **Mock Exam Score Progression**: Table of completed timed full-length simulations with net scores, accuracy, paper codes, and completion dates.
* **Zero-Data New User Handling**: Clean, welcoming empty state with clear calls to action to attempt the Daily Quiz or explore PYQs.
* **Target Customization Modal**: Allows instant editing of target exam year, daily study duration, and optional subject.

### B. Personal Study Planner Workspace (`/study-planner`)
* **Multi-Horizon Task Views**: Tab switches for **Daily Horizon** (due within 2 days or overdue), **Weekly View** (due within 7 days), and **Monthly / All View**.
* **Task Creation**: Modal allowing aspirants to select from 9 canonical UPSC subjects (`Polity & Governance`, `History & Art & Culture`, `Geography`, `Economy & Social Development`, `Environment & Ecology`, `Science & Technology`, `CSAT & Reasoning`, `Current Affairs`, `Mains Answer Writing`), enter a topic title, allocate target hours, and set a due date.
* **Task State Management**: Instant completion toggle with strikethrough styling and achievement tracking.
* **Task Editing & Deletion**: Modal for adjusting task title, target hours, and due dates, with confirmation modals for deletion.
* **Overdue Tracking**: Automatic calculation of overdue status and days remaining.
* **Time Tracking Metrics**: Real-time display of total planned hours vs. completed tasks.
* **3-Pillar Daily Compass**: Integrated access to today's high-priority current affairs story, connected historical PYQs, and spaced repetition items.
* **Custom Timetable Generator**: Generates customized study timetable blueprints based on daily available hours (2–12 hours) and target exam date.

### C. Personal Study Notes Workspace (`/notes`)
* **Search & Filter**: Real-time keyword search across note annotations, referenced question text, topics, and subjects. Dropdown filter by subject.
* **Inline Note Editing**: Aspirants can edit their note content directly on the card and save updates via `POST /api/v1/user/notes`.
* **Note Deletion**: Secure deletion with a confirmation dialog via `DELETE /api/v1/user/notes?id=...`.
* **Direct Navigation**: "View Question in Explorer" link takes students directly to the question in `/pyqs`.
* **Private Tenant Scoping**: Strictly isolated to the authenticated user.

### D. Enhanced Bookmarks Explorer (`/bookmarks`)
* **Compound Filtering**: Instant filtering by Subject, Year (2019–2024), and Paper (GS1 vs. CSAT).
* **Text Search**: Real-time query matching on question text, topics, and pedagogical explanations.
* **Bookmark Removal**: Remove button with confirmation modal preventing accidental deletions.
* **Direct Navigation**: "Open in Explorer" link preserves paper and year context in `/pyqs`.
* **Empty State Guidance**: Clear instructions for discovering and bookmarking high-yield questions.

---

## 3. APIs Implemented & Enhanced

| Endpoint | Method | Description | Security & Isolation |
| :--- | :---: | :--- | :--- |
| `/api/v1/analytics/dashboard` | `GET` | Returns complete aspirant telemetry: profile targets, today study progress, 7-day activity, GS1 vs CSAT breakdown, syllabus coverage, weak/strong topics, and mock scores | Scoped strictly to authenticated `userId`; zero data leak |
| `/api/v1/user/profile` | `GET` | Fetches authenticated aspirant's profile targets (`targetYear`, `dailyGoalMinutes`, `optionalSubject`) | Requires authenticated user; returns default 2027/60min if no profile exists |
| `/api/v1/user/profile` | `PATCH` | Updates aspirant target examination year, daily goal minutes, optional subject, and user full name | Upserts into `UserProfile` tied to `userId` |
| `/api/v1/user/goals` | `GET` | Lists all personal study goals/tasks for the authenticated user with overdue and days-remaining calculations | Scoped strictly to `userId`; sorted by achievement and due date |
| `/api/v1/user/goals` | `POST` | Creates a new study task with title, target hours, and due date | Enforces minimum length and active goal limits (max 30) |
| `/api/v1/user/goals` | `PATCH` | Updates task title, target hours, due date, or toggles `isAchieved` | Validates task ownership; returns 404 if not owned by user |
| `/api/v1/user/goals` | `DELETE` | Deletes a study task by query param `id` | Validates task ownership; returns 404 if not owned by user |
| `/api/v1/user/notes` | `GET` | Fetches private annotations with linked question text, paper, subject, and topic | Scoped strictly to `userId` |
| `/api/v1/user/notes` | `POST` | Creates or updates private note for a question with plan quota check | Scoped strictly to `userId` |
| `/api/v1/user/notes` | `DELETE` | Deletes a note by query param `id` or `questionId` | Validates note ownership; returns 404 if not owned by user |
| `/api/v1/user/bookmarks` | `GET` | Lists all saved bookmarks with question options, series key, and explanations | Scoped strictly to `userId` |
| `/api/v1/user/bookmarks` | `POST` | Toggles bookmark for a question with plan quota verification | Scoped strictly to `userId` |

---

## 4. Database Models Reused

Zero database migrations were required. All existing Neon PostgreSQL tables were utilized efficiently:

* `User`: Name, email, role, and relational links.
* `UserProfile`: `targetYear`, `optionalSubject`, `dailyGoalMinutes`, `updatedAt`.
* `StudyGoal`: `id`, `userId`, `title`, `targetHours`, `targetDate`, `isAchieved`, `createdAt`.
* `UserAttempt`: Attempt records with `isCorrect`, `timeSpentSeconds`, `mode`, `createdAt`.
* `UserNote`: `id`, `userId`, `questionId`, `content`, `updatedAt`.
* `Bookmark`: `id`, `userId`, `questionId`, `folderTag`, `createdAt`.
* `ReviewSchedule`: Spaced repetition items with `nextReviewDate`, `isResolved`, `repetitionCount`.
* `TestSession`: Timed simulation records with `netScore`, `correctCount`, `attemptedCount`, `submittedAt`.
* `Question`, `Paper`, `Subject`, `Topic`: Verified question bank metadata.

---

## 5. Automated Test Results

A dedicated test suite was created in `tests/day4_dashboard_workspace.test.mjs` verifying the complete Day 4 lifecycle:

```bash
node --test tests/day4_dashboard_workspace.test.mjs
```

### Test Execution Output:
```
✔ Day 4 Dashboard: Aspirant Analytics API Returns Complete Telemetry (10736.68ms)
✔ Day 4 Dashboard: Graceful Zero-Data Empty State for New User (7158.81ms)
✔ Day 4 Profile API: GET and PATCH User Target Preferences (4136.68ms)
✔ Day 4 Study Goals: Full CRUD Lifecycle & Cross-User Security Isolation (11980.12ms)
✔ Day 4 Notes: CRUD & Strict Cross-User Isolation (12626.19ms)
✔ Day 4 Bookmarks: Tenant Isolation & Toggle (9796.23ms)

ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 56519.32
```

### Concurrency Optimization:
To prevent Neon serverless connection pool saturation when running all test files, `package.json` test script was updated to use `--test-concurrency=1`:
```json
"test": "node --test --test-concurrency=1 tests/*.test.mjs"
```

---

## 6. Next.js Production Build Result

`npm run build` was executed and completed with 0 errors:

```
> pravaah-upsc@1.0.0 build
> prisma generate && next build

✔ Generated Prisma Client (v5.22.0)
▲ Next.js 14.2.35
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ✓
   Generating static pages (33/33)
   Finalizing page optimization ✓

Route (app)                              Size     First Load JS
├ ○ /bookmarks                           4.62 kB         105 kB
├ ○ /dashboard                           7.29 kB         104 kB
├ ○ /notes                               4.08 kB         101 kB
├ ○ /revision                            4.59 kB        96.3 kB
├ ○ /study-planner                       9.15 kB         106 kB
├ ƒ /api/v1/analytics/dashboard          0 B                0 B
├ ƒ /api/v1/user/goals                   0 B                0 B
├ ƒ /api/v1/user/notes                   0 B                0 B
├ ƒ /api/v1/user/profile                 0 B                0 B
...
Total 33 static pages & dynamic endpoints compiled cleanly.
```

---

## 7. Routes for Manual Verification

The user can test the following routes on the running application (`http://localhost:3000` or production/preview):

1. **Personal Aspirant Dashboard**: `http://localhost:3000/dashboard`
   * Verify welcome banner displays name and target year badge.
   * Verify "Customize Goal" modal updates target year and daily study minutes.
   * Verify 7-day activity chart and paper comparison render with authentic data.
   * Verify subject mastery bars and weak topic drills work.
2. **Study Planner & Tasks**: `http://localhost:3000/study-planner`
   * Switch between **Daily Horizon**, **Weekly View**, and **Monthly View**.
   * Click "+ Add First Task" / "Create Study Task", select a UPSC subject, and add a goal.
   * Click checkbox to mark task completed; click "Edit" to modify hours/due date.
   * Click "Today's 3-Pillar Compass" tab to view what to study today and connected PYQs.
   * Click "Timetable Generator" tab to generate a custom timetable.
3. **Saved Bookmarks**: `http://localhost:3000/bookmarks`
   * Search for keywords (e.g. "Governor" or "Article").
   * Filter by Subject (e.g. Polity) or Year (e.g. 2024).
   * Click "Open in Explorer" to navigate to the question in the PYQ Explorer.
   * Click "Remove" to test the removal confirmation modal.
4. **Private Study Notes**: `http://localhost:3000/notes`
   * Search notes by mnemonic or annotation text.
   * Filter notes by subject.
   * Click "Edit" on a note card to modify the annotation and save.
   * Click "Delete" on a note card to test deletion with confirmation.
5. **Spaced Revision Queue**: `http://localhost:3000/revision`
   * Filter by mistake root cause (`Concept not clear`, `Forgotten fact`, etc.).
   * Reschedule with `+1 Day`, `+3 Days`, `+7 Days`, `+14 Days` or "Mark Mastered".
