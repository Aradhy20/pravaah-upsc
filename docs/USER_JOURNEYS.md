# PRAVAAH UPSC — User Journeys & Learning Loops

This document details the connected end-to-end user journeys across Pravaah UPSC, tracking the user experience from first touch through master-level revision.

---

## Journey A: First-Time Visitor Onboarding

```
Homepage (/) ──> Keyword Search / Exam Directory ──> PYQ Practice ──> Attempt Question ──> Instant Pedagogical Feedback ──> Account Creation / Save Progress
```

1. **Discovery:** Aspirant lands on `https://pravaah-upsc.vercel.app/`. The hero header clearly explains the platform's core proposition: 1,079 officially verified UPSC questions (2019–2024 Series A), concept-based explanations, strict exam simulation, and automated spaced mistake revision.
2. **Search or Direct Action:** User can:
   - Type a keyword into the prominent search bar (e.g., "Monetary Policy Committee", "Fundamental Rights").
   - Click one of the quick workflow pills: **Today's Daily Quiz**, **Current Affairs**, **Mains & Essay Writing**, or **Official UPSC Exams Directory**.
   - Jump directly to **GS Paper 1** or **CSAT Paper 2**.
3. **Seamless Transition:** Search queries navigate to `/pyqs?q=keyword` without reload or lost parameters.
4. **Immediate Engagement:** Visitors can answer questions immediately in Learn Mode without forced login paywalls.
5. **Progress Preservation:** When bookmarking, saving private notes, or writing Mains drafts, the UI prompts authentication while preserving the student's active work in session.

---

## Journey B: Previous-Year Question (PYQ) Practice

```
/pyqs ──> Filter by Exam/Paper/Year/Subject ──> Choose List or Sequential Focus Mode ──> Answer Question ──> Reveal Pedagogical Breakdown ──> Bookmark / Private Note / Report Issue ──> Next Question (Keyboard ← / →)
```

1. **Multi-Faceted Filtering:** Filters combine dynamically (e.g., `Paper: GS1`, `Years: 2023,2024`, `Subject: Polity & Governance`). All queries reflect in URL search parameters (`/pyqs?paper=GS1&years=2023,2024&subject=Polity+%26+Governance`) allowing bookmarkable and shareable views.
2. **View Mode Selection:**
   - **List View:** 15 questions per page with pagination controls.
   - **Sequential Practice (Focus Mode):** Renders one question at a time with a prominent progress indicator (`Question X of 1,079`), Next/Previous controls, and keyboard navigation (`ArrowRight` / `ArrowLeft`).
3. **Learn Mode Interaction:**
   - Student selects an option (`A`, `B`, `C`, or `D`).
   - Card locks against double selection, reveals green highlight for correct key and red highlight for incorrect option.
   - Automatically records attempt to `/api/v1/attempts/learn`.
4. **Pedagogical Drawer:**
   - Official UPSC Series A Key.
   - Core concept takeaway and detailed statement-by-statement breakdown.
   - Elimination technique and standard textbook citation (e.g. Laxmikanth, NCERT, Ramesh Singh).
5. **Academic Audit & Issue Reporting:**
   - Students can click the **Flag** icon to report ambiguities or typos.
   - The report is submitted to `/api/v1/questions/report` and logged into `ContentReview` for human editorial audit.

---

## Journey C: Timed Mock Examination

```
/mock-tests ──> Select Paper (GS1 / CSAT) ──> Review UPSC Instructions ──> Start Session (/mock-tests/[id]) ──> 2-Hour Timer Countdown ──> Navigate Questions / Mark for Review ──> Auto-Save to localStorage ──> Submit Exam ──> Scorecard & Detailed Analysis ──> Push Mistakes to Revision
```

1. **Selection & Instructions:** User reviews official UPSC guidelines (GS1: 100 Qs, 200 marks, +2.0/-0.666; CSAT: 80 Qs, 200 marks, +2.5/-0.833, 33% qualifying threshold).
2. **Anti-Leak Security:** Server initialises session via `/api/v1/tests/session/start`, stripping correct answers and explanations from the client payload.
3. **Session Persistence:**
   - Responses and remaining seconds are continuously backed up in `localStorage` (`pravaah_mock_session_[id]`).
   - If the student accidentally reloads the page or loses connectivity, their answers, marked review status, and timer state are immediately restored upon reconnection.
4. **Grading & Scoring:**
   - Server calculates raw score, penalty deductions (-1/3rd rule), net score, accuracy percentage, and subject breakdown.
   - Incorrect answers are automatically registered into the user's personal Revision Queue (`RevisionSchedule`).
5. **Solution Review:** Complete question-by-question explanations, selected answers, and elimination techniques are displayed post-submission.

---

## Journey D: Current Affairs to Syllabus Practice

```
/current-affairs ──> Browse Published Stories ──> Read Original Summary ──> View Official Source & Date ──> Identify GS Paper Relevance (GS1-4) ──> Solve Linked Historical PYQs ──> Take Daily Quiz
```

1. **Curated Stories:** Stories are backed by verified government and authoritative sources (PIB, The Hindu, Indian Express, RBI Gazette).
2. **Syllabus Mapping:** Each story features explicit tags connecting it to relevant UPSC GS papers (e.g., `GS2: International Relations`, `GS3: Science & Tech`).
3. **Connected Learning:** Direct hyperlinks allow students to practice previous-year questions related to the news theme.

---

## Journey E: Daily Practice Quiz

```
/daily-quiz ──> Load Active Quiz ──> Answer 5 Prelims Questions ──> Submit Quiz ──> View Score & Explanations ──> Spaced Mistake Scheduling
```

1. **Curated Daily Challenge:** 5 high-yield prelims-standard questions mapped to contemporary themes and static foundations.
2. **Double-Submission Prevention:** UI locks buttons while scoring transaction completes.
3. **Immediate Feedback:** Complete scoring with negative marking, official explanations, and seamless push of missed questions to the Revision Bank.

---

## Journey F: Mains & Essay Answer Writing

```
/mains ──> Select Paper (GS1, GS2, GS3, GS4, or ESSAY) ──> Select Question ──> Live Word Counter & Stopwatch ──> Self-Evaluation Checklist ──> Save Draft ──> Review Past Drafts
```

1. **Authentic Question Provenance:** Authentic UPSC CSE Mains questions covering GS1 through GS4 and Section A/B Essay topics.
2. **Writing Workspace:**
   - Real-time word counter with official limits (150 words / 250 words / 1,000 words).
   - Writing stopwatch to track speed per question.
   - Multi-dimensional framework guidance (Introduction, Body Dimensions, Counter-arguments, Way Forward, Conclusion).
   - Standard UPSC self-evaluation checklist (Multi-dimensional, Case studies/facts cited, Way forward included).
3. **Draft Persistence:** Unfinished drafts are securely stored to `/api/v1/mains/draft` and reloaded whenever the student returns to that question.
