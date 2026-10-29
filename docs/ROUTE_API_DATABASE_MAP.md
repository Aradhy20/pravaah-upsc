# PRAVAAH UPSC — Route, API & Database Inventory Map

**Platform:** Pravaah UPSC  
**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, NextAuth  
**Database:** Relational (`prisma/schema.prisma`)  

---

## 1. Route to API and Database Matrix

| Frontend Route | Primary API Route | Prisma Models | HTTP Methods | Access Level | UI States Handled |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` (Homepage) | Direct Server Render | `Paper`, `Question` (Aggregates) | GET | Public | Hero, Keyword Search, Year-wise Grid, Subject Cards, Daily Shortcuts |
| `/pyqs` (PYQ Explorer) | `/api/v1/questions` | `Question`, `Option`, `Explanation`, `Subject`, `Topic` | GET | Public | Loading Spinner, List View (15/pg), Sequential Focus Mode (`←`/`→`), Empty Filter State, Error Retry |
| `/pyqs` (Utility Actions) | `/api/v1/attempts/learn`<br>`/api/v1/user/bookmarks`<br>`/api/v1/user/notes`<br>`/api/v1/questions/report` | `UserAttempt`, `Bookmark`, `UserNote`, `ContentReview` | POST | Public (Demo Mode) / Authenticated | Instant Feedback, Bookmark Active/Inactive, Note Saved Badge, Issue Modal Flagged |
| `/mock-tests` | Direct Server Render | `Test`, `Paper`, `Question`, `TestSession` | GET | Public | Standard Catalogue, Paper Duration, Question Count, Negative Marking Badges |
| `/mock-tests/[testId]` | `/api/v1/tests/session/start`<br>`/api/v1/tests/session/submit` | `TestSession`, `SessionResponse`, `Question`, `Option`, `RevisionSchedule` | POST | Public (Demo Session) / Authenticated | Environment Prep Loading, 2-Hour Timer, Anti-Leak Key Masking, `localStorage` Recovery, Scorecard Breakdown, Question-by-Question Solutions |
| `/current-affairs` | `/api/v1/current-affairs` | `CurrentAffairs`, `Subject`, `Topic`, `Question` | GET | Public | Date Banner, Syllabus Tag (GS1-4), Original Source Link, Linked PYQs, Empty State, Retry State |
| `/daily-quiz` | `/api/v1/quiz/daily`<br>`/api/v1/quiz/submit` | `DailyQuiz`, `DailyQuizQuestion`, `Question`, `Option`, `UserAttempt` | GET, POST | Public (Guest Attempt) / Authenticated | 5-Question Stepper, Negative Marking (+2.0/-0.666), Double-Submission Prevention, Scorecard & Explanations, Push to Revision |
| `/mains` | `/api/v1/mains`<br>`/api/v1/mains/draft` | `MainsQuestion`, `MainsUserDraft` | GET, POST | Public (Read) / Authenticated (Draft Persistence) | GS1-4 & Essay Tabs, Live Word Counter, Practice Stopwatch, Evaluation Rubric, Draft Save Indicator, Empty State |
| `/exams` | `/api/v1/exams` | Static Directory / Database Directory | GET | Public | 8 Exam Profiles (CSE, CDS, NDA, CAPF, etc.), Official Eligibility, Notification Links, Exam Stages |
| `/study-planner` | `/api/v1/study-planner/today`<br>`/api/v1/study-planner/generate` | `StudyPlan`, `StudyPlanTask`, `UserProgress` | GET, POST | Public (Guest Demo) / Authenticated | "What to study today", "Important for UPSC", "What to revise next", Task Completion Checkbox |
| `/revision` | `/api/v1/revision/due`<br>`/api/v1/revision/action` | `RevisionSchedule`, `Question`, `Option`, `Explanation` | GET, POST | Authenticated (Demo Fallback) | Overdue, Due Today, Upcoming Review, Interval Days, Retry Question, Mark Mastered |
| `/dashboard` | `/api/v1/analytics/dashboard` | `UserAttempt`, `TestSession`, `Subject`, `Topic` | GET | Public (Guest Preview) / Authenticated | Accuracy %, Attempt Volume, Subject Mastery Bar Charts, Weak Topic Warnings, Mock Test History |
| `/pricing` | Direct Server Render | `SubscriptionPlan`, `UserSubscription` | GET | Public | Free Aspirant vs Premium Mains & Test Series, Server Entitlement Verification, Transparent Feature Comparison |
| `/admin/ingestion` | `/api/v1/admin/ingestion`<br>`/api/v1/admin/export` | `ContentImportJob`, `ContentReview`, `AuditLog`, `Question` | GET, POST | Admin Only (`role = 'ADMIN'`) | Source Register Audit, Ingestion Triggers, Dry-Run Validation, CSV/JSON Export |

---

## 2. API Contract & Security Isolation Rules

1. **Anti-Leak Defense:** During test sessions (`/api/v1/tests/session/start`), `correctOption` and `explanation` are explicitly excluded from returned payloads to prevent inspection via browser devtools.
2. **User Data Scoping:** All student notes, bookmarks, exam attempts, and mains drafts enforce `where: { userId: session.user.id }`.
3. **Safe Guest Fallbacks:** Public visitors are granted preview and practice capability with local session persistence instead of throwing uncaught exceptions.
