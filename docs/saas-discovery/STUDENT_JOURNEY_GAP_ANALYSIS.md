# PRAVAAH UPSC — STUDENT JOURNEY GAP ANALYSIS & WORKFLOW SIMULATION

**Audit Date:** November 28, 2026  
**Auditor:** Principal UPSC EdTech Product Manager & Student Experience Lead  
**Objective:** End-to-End Simulation of a First-Time Aspirant's 25-Step Learning Journey  
**Scope:** Discovery, Onboarding, Practice, Mains, Interview, Revision, Checkout & Retention  

---

## 1. Executive Summary: The Aspirant Experience Today

When a genuine UPSC aspirant lands on Pravaah UPSC today, their journey is characterized by **an initial impression of polished elegance followed by abrupt operational roadblocks**. 

A student can register, browse the syllabus, review ~120 high-quality Prelims questions, take a timed practice test, make notes, and watch curated strategy videos. However, as soon as they attempt to practice daily current affairs, write a Mains answer, explore interactive maps, search across the platform, or upgrade to a paid plan, the platform either crashes with HTTP 500 or runs out of content.

---

## 2. Step-by-Step 25-Point Student Journey Trace

| # | Journey Stage & Step | Implementation Reality | Functional Status | Failure Points & Operational Gaps |
| :-: | :--- | :--- | :---: | :--- |
| **1** | **Homepage Discovery (`/`)** | Polished Next.js hero page with trust markers and feature cards. | 🟢 **SMOOTH** | None. Fast load time ($<1.2$s), clear academic branding. |
| **2** | **Understanding Value Proposition** | Feature cards and FAQs explain PYQ analytics, AI mentorship, and syllabus mapping. | 🟡 **OVER-PROMISES** | Advertises 9,500+ questions and live AI evaluation; database currently has 121 published questions. |
| **3** | **Student Registration (`/register`)** | Name, email, password, optional subject, target year form. | 🟢 **SMOOTH** | Creates `User` and `UserProfile` atomically; assigns free tier. Returns HTTP 201. |
| **4** | **Student Login (`/login`)** | Email + Password authentication. | 🟢 **SMOOTH** | Issues secure `HttpOnly` session cookie (`pravaah_user_id`). Sets session instantly. |
| **5** | **Language Selection** | Top navbar language switcher (`EN` / `HI`). | 🟢 **FUNCTIONAL** | Switches UI navigation strings cleanly. Questions with verified Hindi display bilingual text. |
| **6** | **Profile Setup (`/onboarding`)** | Target year, optional subject, daily study goal (hours/min). | 🟢 **FUNCTIONAL** | Successfully persists to `UserProfile` table. |
| **7** | **Target Exam Selection** | Default: UPSC CSE; 14 alternative tracks listed on `/exams`. | 🟡 **LIMITED** | Non-CSE examination tracks display patterns, but contain zero question papers. |
| **8** | **Preparation Stage Setting** | Beginner, Intermediate, Advanced selector. | 🟢 **FUNCTIONAL** | Stored in `UserProfile.preparationStage`. |
| **9** | **Diagnostic Assessment** | Mini CSAT or Prelims diagnostic drill (`/csat-coach`). | 🟢 **FUNCTIONAL** | Evaluates basic aptitude. Limited by total CSAT question count (47 questions). |
| **10** | **Personalized Study Plan (`/study-planner`)** | Daily study blocks allocated across GS and Optional. | 🟡 **ISOLATED** | Schedule adjustments are stored in browser `localStorage`; does not sync across mobile/desktop. |
| **11** | **PYQ Practice Loop (`/pyqs`)** | Filter by year (1995–2024), paper, and academic subject. | 🔴 **CONTENT CLIFF** | **Severe content exhaustion:** Total published bank is 121 questions. Student runs out of questions in 2–3 days. |
| **12** | **Explanation & Learning** | Detailed pedagogical solution with elimination techniques. | 🟢 **EXCELLENT** | 100% of published questions have comprehensive solutions with faculty citations. |
| **13** | **Notes & Bookmarks** | Bookmark questions (`/bookmarks`) and attach study notes (`/notes`). | 🟢 **SMOOTH** | Reads/writes directly to PostgreSQL `Bookmark` and `UserNote` tables. |
| **14** | **Timed Mock Tests (`/mock-tests/[testId]`)** | Full exam player with countdown timer and question palette. | 🟢 **FUNCTIONAL** | Authentic scoring (+2.0/-0.666). Limited by availability of test papers (only 3 presets). |
| **15** | **Performance Tracking (`/dashboard`)** | Daily question streak, accuracy percentage, time per question. | 🟢 **FUNCTIONAL** | Displays real metrics computed from completed `TestSession` records. |
| **16** | **Mistake Revision (`/revision`)** | Spaced repetition and mistake review notebook. | 🟡 **STUBBED** | Displays bookmarked questions; automated mistake tagging (`UserMistakeClassification`) has 0 rows. |
| **17** | **Current Affairs (`/current-affairs`)** | Daily news summaries and syllabus linkages. | 🔴 **STALE** | Contains 56 static articles seeded weeks ago. Publication dates are null. No daily updates. |
| **18** | **Mains Answer Writing (`/mains`)** | Descriptive questions with word limits and AI evaluation. | 🔴 **CRASHES** | Typing answer works, but clicking "Evaluate" calls `/api/v1/mains/evaluate` which throws **HTTP 500**. |
| **19** | **Progress Recommendations** | Mission Control (`/mission-control`) readiness score. | 🟢 **FUNCTIONAL** | Computes readiness index from completed syllabus nodes and practice attempts. |
| **20** | **Plan Upgrade Selection (`/pricing`)** | Pricing cards for Plus (₹149/mo), Pro (₹299/mo), Elite (₹499/mo). | 🟡 **MISMATCH** | UI renders canonical prices, but backend `/api/v1/plans` returns legacy ₹399/₹799 prices. |
| **21** | **Checkout Initialization** | Clicking "Upgrade" calls `/api/v1/payments/create-order`. | 🔴 **CRASHES** | Order creation fails on live production with **HTTP 500** (`authentication Failed`). |
| **22** | **Payment Verification** | Cashfree hosted checkout redirect and webhook processing. | 🔴 **UNREACHABLE** | Blocked upstream by Step 21. Webhook logic is coded and tested, but cannot fire. |
| **23** | **Premium Feature Activation** | Instant unlocking of Timed Exams and AI Mentor upon payment. | 🔴 **UNREACHABLE** | Blocked by Step 21. |
| **24** | **Continued Advanced Learning** | Daily current affairs drills, full mocks, AI mentor sessions. | 🔴 **BLOCKED** | Without active premium activation or content expansion, advanced learning stalls. |
| **25** | **Subscription Management (`/dashboard/billing`)** | Cancel subscription, view renewal dates and invoices. | 🟢 **FUNCTIONAL** | Correctly displays plan tier, cancellation endpoint works, transaction ledger is intact. |

---

## 3. Can Pravaah Replace Other Preparation Portals?

### The Reality: **NO.**

1. **Official Government Services Exemption:** Pravaah UPSC is an ed-tech preparation companion. It cannot and must never attempt to replace the official Union Public Service Commission portal ([upsc.gov.in](https://upsc.gov.in/)). Official examination notifications, OTR (One Time Registration), admit cards, and application forms must always link to authoritative government websites.
2. **Supplementary Resource Dependency:** Today, an aspirant using Pravaah UPSC must still visit external websites (e.g. Vision IAS for daily current affairs compilations, UPSC official website for full PDF papers, InsightsonIndia for secure answer writing communities) to complete basic daily preparation tasks.
