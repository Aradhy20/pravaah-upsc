# FRONTEND FUNCTIONAL QA & USER JOURNEY REPORT

**Date**: November 23, 2026  
**Target Environment**: Production ([https://pravaah-upsc.vercel.app](https://pravaah-upsc.vercel.app))  
**Auditor**: Senior QA Lead + Frontend Engineer  
**Pages Audited**: 17 Core Routes + Sub-pages  
**Overall Frontend Pass Rate**: 100% PASS  

---

## 1. Executive Summary

Every public and authenticated frontend page of the Pravaah UPSC SaaS application was audited across Desktop, Tablet, and Mobile viewport configurations. Navigation links, filter queries, state persistence, exam simulation timers, and bilingual toggles were interactively validated. Zero broken links or dead buttons were detected.

---

## 2. Route-by-Route Verification Matrix

| Route Path | Page Title | Authenticated View | Mobile Responsive | Key Elements Tested | Status |
|---|---|---|---|---|---|
| `/` | Pravaah UPSC - Modern SaaS | Public Homepage | Fully Responsive (Flex column) | Hero, CTA buttons, Trust badges, Feature grid | **PASS** |
| `/login` | Aspirant Sign In | Auth Form | Single Column Touch-friendly | Email/Password, Google OAuth button, Error toasts | **PASS** |
| `/register` | Create Aspirant Account | Registration | Single Column Touch-friendly | Validation, Target year, Medium selector | **PASS** |
| `/dashboard` | Personal UPSC Cockpit | Authenticated | Responsive Grid | Genuine stats, Accuracy graph, Weak areas | **PASS** |
| `/prelims/pyqs` | 30-Year UPSC PYQ Explorer | Interactive | Sticky filter drawer | Year dropdown, Subject filter, Hindi/English toggle | **PASS** |
| `/mock-tests` | Full-Length Mock Catalogue | Examination | Test Card List | Paper 1 & CSAT cards, Negative marking notice | **PASS** |
| `/daily-quiz` | Daily 5-Question Prelims Drill | Practice | Touch option buttons | Instant grading, Explanation reveal on submit | **PASS** |
| `/mains` | Mains Answer Writing & AI | Interactive | Split editor layout | Authentic question, Word counter, Framework guide | **PASS** |
| `/study-planner` | Daily Syllabus Guide | Planner | Timeline view | 3 core questions answered, NCERT mappings | **PASS** |
| `/coverage` | 30-Year Exam Coverage Matrix | Informational | Scrollable table | 14 exam families, 448 targets visualized | **PASS** |
| `/pricing` | Transparent UPSC Plans | Commercial | 3-Card Comparison | ₹2,999, ₹5,499, ₹8,999 plans with GST breakdown | **PASS** |
| `/bookmarks` | Saved Questions Archive | Authenticated | List view | Filter by paper, Delete bookmark, Open question | **PASS** |
| `/notes` | Personal Revision Notes | Authenticated | Card grid | Markdown notes, Connected PYQ citations | **PASS** |
| `/revision` | Spaced Repetition Queue | Authenticated | Flashcard drill | SM-2 interval scheduler, Confidence rating | **PASS** |
| `/about` | About Pravaah UPSC | Informational | Prose | Mission, Pedagogy, Authentic source provenance | **PASS** |
| `/faq` | Frequently Asked Questions | Accordion | Collapsible items | Pricing, Official keys, Hindi availability | **PASS** |
| `/privacy` | Privacy Policy | Legal | Clean typography | Data collection, Cookie policy, Security standard | **PASS** |
| `/terms` | Terms of Service | Legal | Clean typography | Fair usage, Non-commercial UPSC fair use, Refunds | **PASS** |

---

## 3. End-to-End User Journey Verifications

### Journey A: Register → Login → PYQ Explorer → Solve → Review Explanation
1. Aspirant visits `/register`, enters name, email, and password. Account is provisioned with hashed password (`bcryptjs`, 10 rounds).
2. Aspirant logs in at `/login`, receiving an `httpOnly`, `SameSite=Lax`, secure JWT session cookie.
3. Aspirant navigates to `/prelims/pyqs`, selects **2024 GS1**.
4. 36 authentic 2024 questions load with 4 options each.
5. Aspirant selects an option: UI locks choice, checks against official answer key, displays green/red feedback, and unfolds the comprehensive pedagogical explanation.
- **Result**: **PASS**

### Journey B: Timed Examination & CSAT Qualifying Score Threshold
1. Aspirant starts 2024 CSAT Paper 2 full exam.
2. Countdown timer runs accurately in browser window.
3. Anti-leak protection: Network payload contains question stems and option texts only (no correct flags).
4. Aspirant submits answers.
5. Backend computes authentic UPSC CSAT marking (+2.5 for correct, -0.833 for incorrect).
6. Result scorecard displays:
   - Total Questions, Attempted, Correct, Incorrect.
   - Raw Score, Deductions, Net Score.
   - **CSAT Qualifying Status**: `isQualified = netScore >= 66`. Aspirant scoring 67.5 marks sees "QUALIFIED (Paper 1 evaluated)". Aspirant scoring < 66 marks sees "NOT QUALIFIED (Requires 66.0 marks)".
- **Result**: **PASS**

### Journey C: Bookmarking & Notes Relational Persistence Across Refresh
1. Aspirant bookmarks question `cmvqr30ot00665y3bp2632pvg` (Miyawaki method).
2. Aspirant writes a personal note: *"Crucial for GS3 Environment urban forestry questions"*.
3. Aspirant refreshes the browser page.
4. Bookmark star icon remains active.
5. Notes drawer immediately retrieves the saved note text from PostgreSQL.
6. Visiting `/bookmarks` displays the saved question with full option context.
- **Result**: **PASS**

### Journey D: Daily Study Planner & Knowledge Grounding
1. Aspirant opens `/study-planner`.
2. System resolves today's focus based on syllabus timeline (e.g. Modern History - Freedom Struggle).
3. The page directly answers the three core aspirant questions:
   - What to study today? (Exact theme and chapter).
   - Which NCERT book? (Class 12 Themes in Indian History Part III).
   - Which previous year questions test this? (Linked 1995–2024 PYQs).
- **Result**: **PASS**

### Journey E: Sandbox Pricing Checkout & Dynamic UPI QR Rendering
1. Aspirant visits `/pricing`, chooses **Prelims Pro (₹5,499)**.
2. Clicking *"Upgrade Plan"* calls `POST /api/v1/payments/create-order`.
3. Order created in PostgreSQL with status `PENDING`.
4. Aspirant is redirected to `/checkout/[orderId]`.
5. Page dynamically renders:
   - Aradhy Jain's personal receiving UPI ID: `jainaradhy123@okicici`
   - Payee: `Aradhy Jain`
   - Exact amount: ₹5,499 (or with applicable taxes)
   - Dynamic SVG QR code encoded with UPI intent `upi://pay?pa=jainaradhy123@okicici&pn=Aradhy%20Jain&am=5499.00&tr=...`
6. Aspirant enters 12-digit UTR in submission box. Order transitions to `UNDER_REVIEW`.
- **Result**: **PASS**

### Journey F: Public Pages Telemetry Integrity (Zero Fabricated Metrics)
1. Aspirant opens homepage and public dashboard without logging in.
2. System returns unauthenticated baseline view.
3. Accuracy shows `0%` or "Start Practice", total attempted shows `0`.
4. No fake "78.4% Average Accuracy" or fabricated student reviews are displayed.
- **Result**: **PASS**
