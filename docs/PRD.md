# Product Requirements Document (PRD)
## Platform: Pravaah UPSC (Civil Services Examination PYQ Learning Platform)
**Version:** 1.0.0 (Production Release Specification)  
**Author:** Antigravity Architect & Product Team  
**Date:** October 2026  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Product Vision

### 1.1 Vision Statement
**Pravaah UPSC** ("Flow of Knowledge") is an open, high-fidelity, concept-driven learning platform for UPSC Civil Services Examination (CSE) aspirants. Built on the core promise:
> **"Find the PYQ. Understand the concept. Learn from every mistake."**

While traditional coaching platforms treat Previous Year Questions (PYQs) as static PDFs or raw question banks, **Pravaah** transforms PYQs into an interactive, concept-linked diagnostic learning system. It helps aspirants navigate across 10+ years of General Studies Paper I and Paper II (CSAT), understand the exact reasoning behind correct and incorrect options, track subject and topic weak points in real-time, and systematically conquer mistakes through active spaced revision.

### 1.2 Core Problem Statement
UPSC aspirants face four critical friction points when preparing with PYQs:
1. **Unreliable Answer Keys & Conflicting Explanations:** Commercial guidebooks and coaching answer keys frequently contradict official UPSC keys released after final results. Aspirants learn wrong interpretations.
2. **Fragmented Navigation:** Aspirants cannot dynamically cross-filter by Year, Subject (e.g., Polity, Economy, Modern History, Environment), Topic (e.g., Fundamental Rights, Monetary Policy), and Exam Mode (Timed Exam vs. Immediate Learn Mode).
3. **Passive Solving Without Mistake Tracking:** Aspirants solve papers on paper or PDF without recording *why* they missed a question (conceptual gap, elimination failure, misreading, wild guess). No revision system queues up their missed questions.
4. **Cluttered, Ad-Heavy, Paywalled Interfaces:** Existing platforms suffer from slow web performance, aggressive popups, deceptive paywalls, and low accessibility on mobile devices.

---

## 2. Target Users & User Personas

### Persona 1: Ananya Sharma — The First-Attempt Aspirant (Foundation Stage)
- **Profile:** 22, final-year graduate preparing for UPSC CSE Prelims 2027.
- **Needs:** Needs to understand UPSC question patterns topic-by-topic alongside NCERT and standard books (e.g., read Laxmikanth's "Preamble" then immediately solve all PYQs on Preamble from 2011 to 2025).
- **Pain Point:** Overwhelmed by full-length 100-question PDFs; wants instant step-by-step explanations for each option to build conceptual clarity.
- **Preferred Mode:** Learn Mode with immediate feedback, bookmarking, and concept tags.

### Persona 2: Vikramaditya Verma — The Veteran Re-Taker (Optimization Stage)
- **Profile:** 26, appeared in two Prelims, missed cutoff by 3.5 marks in CSAT and GS-1.
- **Needs:** Needs realistic timed simulation (2 hours, 100 questions, -0.66 negative marking for GS1; 80 questions, -0.83 negative marking for CSAT) under strict exam conditions.
- **Pain Point:** Struggles with time allocation and negative marking traps. Needs exact error-pattern analytics (e.g., "Accuracy on Environment questions dropped to 42% when spending less than 45 seconds").
- **Preferred Mode:** Exam Mode, detailed scorecard, mistake review queue.

### Persona 3: Dr. Rameshwar Rao — Academic Content Reviewer / Administrator
- **Profile:** 40, senior UPSC faculty and subject matter specialist.
- **Needs:** Reliable ingestion workflow to upload official UPSC question papers, verify OCR extraction, validate answer keys against official UPSC notifications, and publish high-quality pedagogical explanations.
- **Pain Point:** Unverified questions or incorrect options entering public question banks without audit trails.
- **Preferred Workflow:** Administrative review pipeline (Draft $\rightarrow$ Needs Review $\rightarrow$ Verified $\rightarrow$ Published).

---

## 3. Competitor & Reference Research Summary

### 3.1 Primary Reference: IASBoard (https://www.iasboard.com)
- **Observed Strengths:**
  - Fast, focused information architecture with clean routes (`/prelims/pyqs`, `/current-affairs`, `/interview/explorer`).
  - Dual Paper toggle (`GS1` - GS Paper 1, `GS2` - GS Paper 2 CSAT) with distinctive color accents.
  - Multi-select year chips with live question counts per year (e.g., `2024 (100)`).
  - Search toggle between **Smart** (semantic concept matching) and **Exact keyword**.
  - In-situ question cards with option selection, immediate correctness feedback, and inline attempt counting.
- **Observed Weaknesses & Opportunities for Pravaah:**
  - Reliance on client-side state for certain progress markers; limited offline-tolerant synchronization.
  - Explanation depth varies; option-by-option rationale is often truncated or crowdsourced.
  - Heavy visual emphasis on paid courses/sprint boards; Pravaah prioritizes an unencumbered academic learning focus.

### 3.2 Secondary Reference: Human Peritus (https://humanperitus.in)
- **Resolved Domain:** `https://humanperitus.in/` (via Google short-link resolution).
- **Core Focus:** Specialized question analysis in Management, Commerce, HR, and Labour Laws for UGC NET and UPSC specialized recruitment exams (e.g., EPFO, ESIC, Civil Services optional).
- **Key Takeaways for Pravaah:**
  - Clean categorization of syllabus subdivisions into rigorous topic silos.
  - Clear separation between General Studies core subjects and specialized optional subjects.

### 3.3 Authoritative Reference: Official UPSC Examination Papers (https://upsc.gov.in)
- **Format Integrity:**
  - **GS Paper 1:** 100 MCQs, 200 Marks, 2 Hours Duration. $+2.00$ for correct, $-0.666$ for incorrect, $0$ for unattempted.
  - **GS Paper 2 (CSAT):** 80 MCQs, 200 Marks, 2 Hours Duration. $+2.50$ for correct, $-0.833$ for incorrect, $0$ for unattempted. Minimum qualifying mark is 33% (66 marks).
  - Provenance rule: Official answer keys are published by UPSC *only* after the final recruitment cycle concludes. Prior to that, answer keys are provisional and must be clearly attributed as such.

---

## 4. Product Goals & Measurable Success Metrics

| Goal | Metric | Target (MVP / 90 Days) |
|---|---|---|
| **Content Accuracy** | Zero verified question errors | 100% of published questions mapped to official UPSC keys |
| **Search & Discovery** | Search query to relevant PYQ latency | $< 150\text{ ms}$ for full-text search |
| **User Engagement** | Practice session completion rate | $> 70\%$ completed practice runs |
| **Revision Retention** | Repeated mistake resolution | $> 60\%$ improvement on re-attempted mistake queue items |
| **Performance** | Core Web Vitals (LCP, FID/INP, CLS) | LCP $< 1.8\text{s}$, INP $< 100\text{ms}$, CLS $< 0.05$ |
| **Accessibility** | WCAG 2.1 Compliance | AA compliant across desktop, tablet, and mobile |

---

## 5. Scope Definition & MoSCoW Prioritization

### 5.1 Must Have (P0 - MVP)
- **Full Question Explorer (`/pyqs`):** Filter by Paper (GS1, CSAT), Year (2014–2024), Subject (Polity, Economy, Geography, History, Environment, Science & Tech, CSAT Quant/Reasoning/Reading Comprehension), Topic, and Difficulty.
- **Dual Practise Modes:**
  - **Learn Mode:** Instant option feedback, detailed question explanation, why each wrong option is incorrect, concept tags, bookmarking, and notes.
  - **Exam Mode:** Full timed simulation with countdown timer, question palette (Answered, Unanswered, Marked for Review), submit modal, automatic scoring, and performance diagnostic breakdown.
- **Search System:** Exact keyword search and full-text index across question stems, options, and explanations.
- **User Revision & Bookmarking:** Authenticated user bookmark queue, personal study notes, mistake history, and attempt log.
- **Learning Analytics Dashboard (`/dashboard`):** Real metrics on total attempted, overall accuracy %, subject-wise accuracy breakdown, time spent per question, and mistake review queue.
- **Content Administration (`/admin`):** Question management, import pipeline for structured JSON/CSV, verification workflow (`draft` $\rightarrow$ `needs_review` $\rightarrow$ `verified` $\rightarrow$ `published`), and audit logging.
- **Responsive & Accessible UI:** Mobile-first, light academic theme with crisp contrast, accessible focus states, and zero layout shift.

### 5.2 Should Have (P1 - Post-MVP Release)
- Custom test builder (`/practice/custom`) allowing aspirants to select specific combinations (e.g., "50 questions from Modern History between 2018 and 2024").
- Spaced repetition scheduling algorithm (SM-2 based mistake review queue).
- PDF export for curated practice worksheets.
- Offline attempt caching with Web Storage sync upon reconnect.

### 5.3 Could Have (P2 - Future Horizon)
- GS Mains PYQ database with model answers and evaluation frameworks.
- Vector embedding semantic search ("Smart Search") using text embeddings.
- Voice-assisted question reading for accessibility.

### 5.4 Won't Have (Explicitly Excluded)
- No user-to-user social networking or chat rooms (distraction from serious prep).
- No unverified user-generated answer keys masquerading as official UPSC keys.
- No AI hallucinations presented as verified facts without authoritative citations.

---

## 6. Functional Requirements Matrix

| ID | Module | Feature | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Navigation | Global Header & Menu | Responsive navigation to Home, PYQs Explorer, Subjects, Mock Tests, Dashboard, Bookmarks, and Admin (if authorized). |
| **FR-02** | Explorer | Paper Filtering | Toggle between GS Paper 1 and GS Paper 2 (CSAT); updates list immediately. |
| **FR-03** | Explorer | Year Multi-Select | Ability to filter by specific years or ranges (e.g., All Years, Last 5 Years, Last 10 Years). |
| **FR-04** | Explorer | Subject/Topic Filter | Dropdown hierarchy allowing selection of subject and corresponding sub-topics. |
| **FR-05** | Question Card | Learn Mode Interaction | Aspirant clicks option $\rightarrow$ Option highlights green (if correct) or red (if incorrect) $\rightarrow$ Detailed explanation reveals with source citation. |
| **FR-06** | Question Card | Bookmarks & Notes | Authenticated user can toggle bookmark and save custom private notes on any question. |
| **FR-07** | Exam Mode | Timed Simulation | Full 100-question or 80-question test session with countdown timer, question palette, and submit confirmation. |
| **FR-08** | Scoring | Marking Scheme | Strict UPSC scoring logic ($+2 / -0.66$ for GS1, $+2.5 / -0.83$ for CSAT); negative marks applied accurately. |
| **FR-09** | Analytics | Diagnostic Report | Displays score, net accuracy, subject breakdown, speed per question, and adds missed questions to revision queue. |
| **FR-10** | Admin | Ingestion Pipeline | Upload JSON/CSV question packets; preview segmented questions; audit answer keys; enforce `verified` state before publishing. |
| **FR-11** | Auth | User Security | Secure session handling, email/password and mock identity for evaluation, role-based access control (Aspirant vs. Admin). |

---

## 7. Non-Functional Requirements (NFR)

1. **Performance:** Public catalog pages must render under 200ms TTFB. Full test submission and scorecard generation in under 300ms.
2. **Security:**
   - Password hashing with strong bcrypt/argon2.
   - Answer keys must NEVER be transmitted to the frontend during an active timed Exam Mode session before user submission.
   - Protection against SQL injection, XSS, and CSRF.
3. **Reliability & Data Integrity:** Relational foreign key constraints ensure no orphaned question options or responses. Audit logs track every administrative modification.
4. **Usability:** High-contrast typography (Inter / system fonts), compliant with WCAG AA. Minimum touch target of $44\times 44$ pixels on mobile.
5. **SEO:** Dynamic meta tags, JSON-LD breadcrumbs, semantic headings, and clean URL slugs (`/pyqs/2024/gs-paper-1`, `/subjects/polity`).

---

## 9. Monetization, Pricing Architecture & Subscription Requirements

### 9.1 Monetization Principles & Philosophy
Pravaah UPSC balances universal educational accessibility with sustainable platform development. We adhere to four strict principles:
1. **Generous Public Foundation:** Core previous year questions (PYQs) and basic explanations remain accessible to every aspirant without mandatory payment.
2. **Honest Value & Tested Capabilities:** Every advertised plan feature corresponds to an actually implemented and tested capability. No deceptive promises of unreleased AI evaluations, Mains answer grading, or simulated topper copies.
3. **Transparent Billing:** Clear monthly, quarterly, and annual billing intervals with no hidden auto-rebill surprises. All prices are displayed upfront with clear renewal and tax policies.
4. **Fair Cancellation & Refund:** 7-day money-back guarantee for initial purchases and hassle-free cancellation that preserves access until the end of the paid billing period.

### 9.2 Product Plan Matrix & Entitlements

| Dimension | Tier 0: Free (Aspirant Foundation) | Tier 1: Beginner (Syllabus Sprint) | Tier 2: Achiever (Prelims Pro) *(Recommended)* | Tier 3: Scholar (Ranker Suite) |
|---|---|---|---|---|
| **Monthly Price** | ₹0 / month | ₹399 / month | ₹799 / month | ₹1,299 / month |
| **Quarterly Price** | ₹0 | ₹999 / quarter | ₹1,899 / quarter | ₹2,999 / quarter |
| **Annual Price** | ₹0 | ₹2,999 / year | ₹5,499 / year | ₹8,999 / year |
| **PYQ Question Bank** | Standard Public PYQs | Expanded Practice Set | Complete PYQ Library (2014–2025) | Complete Archive + Special Series |
| **Explanations** | Standard Core Explanations | Detailed Rationale & Tips | Option-by-Option Deep Dives & Citations | Deep Dives + Contextual Research Notes |
| **Timed Exam Simulator** | ❌ Locked (Preview only) | ❌ Locked (Preview only) | ✅ Full UPSC Timing & Scoring Simulator | ✅ Full Simulator + Multi-year Benchmark |
| **Bookmarks Allowance** | Up to 5 bookmarks | Up to 50 bookmarks | Unlimited Bookmarks | Unlimited Bookmarks |
| **Personal Notes Quota** | Up to 3 notes | Up to 50 notes | Unlimited Notes | Unlimited Notes |
| **Analytics & Diagnostics** | Basic Session Score | Subject-level Accuracy | Weak Topic Detector & Speed Breakdown | Topic Weakness + Cognitive Error Pattern |
| **Revision Queue** | Recent Attempts | Subject-wise Revision | Dynamic Spaced Mistake Queue | Spaced Mistake Queue + Mastery Tracker |
| **Access Control Tier** | Level 0 | Level 1 | Level 2 | Level 3 |

### 9.3 Billing Intervals & Savings Strategy
- **Monthly:** Full flexibility for aspirants studying for short revision sprints.
- **Quarterly:** 15% to 20% effective discount for 3-month focused prelims bootcamps.
- **Annual:** 35% to 42% substantial discount for comprehensive year-long preparation cycles.

### 9.4 Cancellation and Refund Policy
- **Cancellation Policy:** Subscribers may cancel anytime directly from their account settings. Upon cancellation, auto-renewal is immediately stopped, but the user retains full access to their paid tier entitlements until the end of the current paid billing period.
- **Refund Policy:** A 7-day no-questions-asked refund is provided for all initial quarterly and annual plan purchases if the user is unsatisfied with the platform. Refunds are processed through the payment gateway within 5–7 business days.

---

## 10. Pricing & Subscription User Stories

| Story ID | Persona | Action & Requirement | Business / Pedagogical Outcome |
|---|---|---|---|
| **US-P01** | First-Attempt Aspirant | As a new user, I want to explore the pricing page and compare features side-by-side with monthly, quarterly, and annual toggles. | Aspirant understands exact tier differences without hidden surprises or misleading claims. |
| **US-P02** | Foundation User | As a Free-tier user, I want to access standard PYQs, test my basics, and store up to 5 bookmarks without inputting credit card details. | Frictionless onboarding builds product trust and organic study habits. |
| **US-P03** | Serious Aspirant | As an Achiever subscriber, I want to start a full-length 2-hour timed exam with official UPSC negative marking and receive a detailed diagnostic scorecard. | Real exam pressure simulation exposes weak subject areas before the actual prelims. |
| **US-P04** | Upgrading User | As a Beginner user reaching my 50-bookmark limit, I want to seamlessly upgrade to Achiever with immediate entitlement activation. | Smooth path to tier advancement with server-validated billing and instant feature unlock. |
| **US-P05** | Managing Subscriber | As an active subscriber, I want to view my current renewal date, download payment receipts, or cancel my renewal without contacting support. | Transparent user control decreases support tickets and establishes strong consumer confidence. |
| **US-P06** | Platform Administrator | As an admin, I want to view plan subscribers, inspect webhook payment logs, and edit plan pricing or feature tags without redeploying code. | Agile business operations with auditable, server-authoritative plan management. |

---

## 11. Definition of Product Success
The Pravaah UPSC platform is successful when an aspirant can discover any past UPSC question in less than 3 clicks or a single search, solve it in either Learn or Exam mode with zero latency, read an unimpeachable, evidence-backed explanation, manage their preparation via transparent, affordable subscription tiers, and find all erroneous attempts waiting for review in their personal revision queue.
