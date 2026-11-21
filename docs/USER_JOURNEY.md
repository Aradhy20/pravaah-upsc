# PRAVAAH UPSC – COMPREHENSIVE USER JOURNEYS & ASPIRANT PERSONAS

**Document Version:** 1.0  
**Target:** Product Experience, Onboarding & Feature Workflow  
**Author:** Principal SaaS Product Architect & UPSC Academic Strategist  

---

## 1. ASPIRANT PERSONA PROFILES

Pravaah UPSC serves six distinct aspirant demographics, each with unique preparation timelines, constraints, and feature needs:

```mermaid
mindmap
  root((Pravaah Aspirants))
    P1[1. First-Time English Aspirant]
      College student / Graduate
      Needs syllabus clarity & foundation
      Heavy NCERT & PYQ exploration
    P2[2. Hindi-Medium Aspirant]
      Tier 2/3 city background
      Needs authentic Hindi terminology
      Demands equal content depth
    P3[3. Working Professional]
      Limited study time: 3-4 hrs/day
      High discipline, low tolerance for clutter
      Needs micro-learning & high-yield revision
    P4[4. Repeat / Veteran Aspirant]
      Given 1-2 attempts; stuck at Prelims CSAT or Cutoff
      Needs weakness diagnostics & high-level mocks
      Requires analytical score gap analysis
    P5[5. Mains-Focused Candidate]
      Cleared Prelims or confident of clearing
      Needs daily answer evaluation & structure coaching
      Examines Topper Copies and multi-dimensional rubrics
    P6[6. Multi-Exam Aspirant]
      Preparing for UPSC CSE, CAPF AC, CDS, and EPFO
      Needs cross-exam topic overlap filtering
      Practices combined PYQ banks
```

---

## 2. DETAILED END-TO-END JOURNEY MAPS

### Journey 1: The First-Time Aspirant (Syllabus to Readiness)

```mermaid
flowchart TD
    Discovery[1. Discovers Pravaah via Free PYQ Search / Recommendation] --> Register[2. Quick Registration via Google / Email]
    Register --> Onboarding[3. Diagnostic Onboarding: Target Year 2026, Full-Time, English]
    Onboarding --> Dashboard[4. Personalized Dashboard: Day 1 Foundation Roadmap]
    Dashboard --> Tree[5. Explores Syllabus Knowledge Tree: GS2 Indian Polity]
    Tree --> NCERT[6. Reads Linked NCERT Chapter & Solves 10 Foundation PYQs]
    NCERT --> DailyQuiz[7. Submits Daily Current Affairs Quiz & Sees Accuracy: 60%]
    DailyQuiz --> Revision[8. Missed Questions Automatically Added to Spaced Repetition Queue]
    Revision --> Upgrade[9. Hits 50-Question Daily Limit -> Sees Transparent Paywall -> Upgrades to Achiever Tier via UPI]
```

**Key Moments of Delight:**
- Viewing the official UPSC syllabus not as a dry PDF, but as an interactive visual tree where each branch has connected PYQs and NCERT chapters.
- Receiving immediate feedback on *why* an incorrect answer was wrong, citing the specific Constitutional Article or Supreme Court judgment.

---

### Journey 2: The Hindi-Medium Aspirant (देवनागरी प्रथम)

```mermaid
flowchart TD
    Land[1. Aspirant lands on Pravaah Homepage] --> LangSwitch[2. Clicks 'हिंदी' in Header Switcher]
    LangSwitch --> Persistent[3. Entire UI instantly renders in elegant Devanagari typography]
    Persistent --> Browse[4. Navigates to 'प्रारंभिक परीक्षा विगत वर्ष प्रश्न' (Prelims PYQs)]
    Browse --> Filter[5. Filters: 'भारतीय राजव्यवस्था' (Polity) > 'मूल अधिकार' (Fundamental Rights)]
    Filter --> Attempt[6. Solves 2023 Question in Hindi with authentic UPSC terminology]
    Attempt --> DualToggle[7. Unsure of complex phrase? Toggles 'English' button for instant English source check]
    DualToggle --> Video[8. Watches curated Hindi concept lecture in Video Academy]
    Video --> Success[9. Aspirant feels respected as a first-class user, not a second-class translated afterthought]
```

**Key Moments of Delight:**
- Academic terms are translated using official UPSC Commission terminology (e.g., *'संवैधानिक उपचार'*, *'मौलिक कर्तव्य'*, *'विधि द्वारा स्थापित प्रक्रिया'*).
- Zero broken layouts or awkward clipped text in Hindi mode.

---

### Journey 3: The Working Professional (High-Yield Micro-Learning)

- **Daily Budget:** 3.5 hours (1 hr morning commute + 0.5 hr lunch + 2 hrs evening).
- **Morning (08:00 - 09:00):** Opens Pravaah Mobile Web on the train. Reads the 5-minute **Daily Current Affairs** synthesis with pre-extracted GS-1/2/3/4 tags and attempts the **5-Question Daily Current Affairs Quiz**.
- **Lunch Break (13:15 - 13:45):** Solves 10 targeted CSAT or Economy questions from their **Spaced Repetition Revision Queue** on their smartphone.
- **Evening (20:30 - 22:30):** Sits at desktop. Opens **Mains Workspace**, selects today's editorial challenge question, sets the 15-minute timer, types 250 words, and receives an **instant 10-dimension AI evaluation** highlighting missed data points and structure gaps.

---

### Journey 4: The Mains Candidate (The Answer Writing Intensive)

```mermaid
sequenceDiagram
    participant Aspirant
    participant MainsLab as Mains Workspace
    participant Timer as 15-Min Timer
    participant AI as Rubric Evaluation Engine
    participant Topper as Topper Copy Library

    Aspirant->>MainsLab: Selects GS3 Question on "Digital Public Infrastructure"
    Aspirant->>Timer: Starts Exam Mode (Strict 15-minute countdown)
    Aspirant->>MainsLab: Types 250-word answer with Intro, Body, Schemes, Conclusion
    Timer-->>Aspirant: Time Up! Auto-submits answer
    MainsLab->>AI: Analyze against 10 UPSC Evaluation Dimensions
    AI-->>MainsLab: Returns Score: 8.5/15 with granular feedback:
    Note over MainsLab: - Introduction: Strong (Defines DPI & India Stack)<br/>- Analysis: Good dimensions (Health, Payments, Identity)<br/>- Gap: Missed Digital Personal Data Protection Act 2023<br/>- Examiner Tip: Add a flowchart connecting UPI, Aadhaar & DigiLocker
    Aspirant->>Topper: Clicks "Compare with Rank 1 Topper Copy on this theme"
    Topper-->>Aspirant: Displays annotated answer showing how Rank 1 drew the DPI triangle
```

---

## 3. USER ONBOARDING DIAGNOSTIC QUESTIONNAIRE (11 QUESTIONS)

To personalize the roadmap from second one, Pravaah guides every new user through an adaptive 11-step diagnostic:

1. **Target Examination:** `UPSC Civil Services (CSE)` / `CAPF (AC)` / `CDS` / `EPFO` / `State PSC`.
2. **Target Year:** `2025` / `2026` / `2027` / `Later`.
3. **Primary Preparation Medium:** `English` / `हिंदी (Hindi)`.
4. **Current Preparation Stage:** `Beginner (Starting from scratch)` / `Intermediate (Read standard books)` / `Advanced (Appeared in Prelims/Mains)`.
5. **Daily Available Study Time:** `Full-time (8-10 hours)` / `Moderate (5-7 hours)` / `Working Professional / College (2-4 hours)`.
6. **Self-Assessed Weakest Prelims Areas:** `CSAT` / `Economy` / `Environment & Sci-Tech` / `History & Culture` / `Polity` / `Current Affairs`.
7. **Optional Subject:** Selected from the 26 official UPSC optionals (e.g., PSIR, Geography, Sociology, Public Administration, History, Anthropology, Hindi Literature).
8. **Mains Answer Writing Experience:** `Never written an answer` / `Occasional practice` / `Written full test series`.
9. **Current Affairs Source:** `The Hindu` / `Indian Express` / `Monthly Magazines` / `Rely entirely on Pravaah`.
10. **Study Style Preference:** `Question-First (Practice and learn from mistakes)` / `Concept-First (Read/watch then test)`.
11. **Primary Motivation & Accountability Need:** `Strict daily schedule & reminders` / `Self-paced with analytics` / `Exam simulation only`.

---

## 4. PRODUCT RETENTION & HABIT LOOPS

Pravaah establishes daily study momentum through three psychological reinforcement mechanics:

1. **The UPSC Daily Streak:** Visual flame counter tracking consecutive days of answering at least 5 questions or reading daily current affairs.
2. **The Dynamic Readiness Index (0–100%):** A real-time proprietary score calculated from:
   - **Syllabus Coverage (30% weight):** Topics practiced across GS1-4.
   - **Prelims Accuracy (30% weight):** Rolling 30-day accuracy on standard-difficulty questions.
   - **Mains Answer Volume (20% weight):** Number of evaluated answers scoring >= 50%.
   - **Revision Hygiene (20% weight):** Cleared spaced repetition queue items.
3. **The "Next Best Action" Recommendation:** Every time the student opens their dashboard, Pravaah removes decision fatigue by presenting exactly one recommended task: *"Today's Priority: 15 Questions on Modern Indian History (1857-1947) to strengthen your 42% accuracy gap."*
