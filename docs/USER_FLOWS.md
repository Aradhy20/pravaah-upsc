# User Flows and Application Journeys
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Author:** Antigravity UX Research & Engineering Team  

---

## 1. Overview of Key User Journeys
This document models the end-to-end navigational paths, decision branches, system events, and state mutations for both Aspirants and Administrators using Mermaid flowcharts and narrative specifications.

---

## 2. Flowchart 1: First-Time Visitor Journey & Onboarding

```mermaid
flowchart TD
    A[Visitor Lands on Homepage /] --> B{Action Chosen}
    B -->|Search Query| C[Type in Search Bar: e.g., 'Fundamental Rights']
    B -->|Browse by Paper| D[Click 'GS Paper 1' or 'GS Paper 2 (CSAT)']
    B -->|Browse by Year| E[Click Year Pill: e.g., '2024 (100)']
    B -->|Direct Sign In/Up| F[Click 'Sign In' or 'Sign Up Free']
    
    C --> G[Instant Question Search Results]
    D --> H[Prelims PYQ Explorer /pyqs]
    E --> H
    
    G --> I[Interact with Question in Learn Mode]
    H --> I
    
    I --> J{Clicks Option A/B/C/D}
    J --> K[Instant Visual Feedback: Green/Red + Explanation Unveils]
    K --> L{Wants to Bookmark or Save Progress?}
    L -->|Yes| M[Prompts Light-weight Registration / Login Modal]
    L -->|No| N[Continues Free Unrestricted Browsing]
    M --> O[Account Created / Session Initialized]
    O --> P[Bookmark Saved & Added to Personal Revision Queue]
```

### Explanation
- **Visitor Experience:** Zero forced walls. A student can land on Pravaah, immediately search for any topic or year, and solve questions right away in Learn Mode.
- **Conversion Moment:** When the student wants to save a bookmark, track historical accuracy, or launch a 2-hour timed test, the system smoothly prompts login/registration without losing the current question context.

---

## 3. Flowchart 2: Homepage to PYQ Discovery (Smart vs. Exact Keyword)

```mermaid
flowchart TD
    A[User at Search Bar on Homepage or /pyqs] --> B{Selects Search Mode}
    B -->|Smart / Concept Search| C[Search 'Presidential Ordinance power']
    B -->|Exact Keyword Search| D[Search 'Article 123']
    
    C --> E[Engine queries Syllabus Taxonomy + Question Stem + Concepts]
    D --> F[Engine queries exact Full-Text Index on Stems & Options]
    
    E --> G[Returns ranked matches across Year & Subject]
    F --> G
    
    G --> H{Are Filters Applied?}
    H -->|Yes| I[Refine by Paper: GS1 / CSAT & Year Range]
    H -->|No| J[Display Paginated Question Cards]
    I --> J
```

---

## 4. Flowchart 3: Year-Wise & Paper-Wise Question Browsing

```mermaid
flowchart TD
    A[User visits /pyqs] --> B[Default View: GS Paper 1, All Years]
    B --> C{User Selects Filters}
    C -->|Switch Paper| D[Toggle 'GS Paper 2 (CSAT)']
    C -->|Select Year Preset| E[Click 'Last 5 Years' or 'Last 10 Years']
    C -->|Select Specific Year| F[Toggle Year Chip: '2023', '2024']
    
    D --> G[URL updates: /pyqs?paper=GS2&years=2024]
    E --> G
    F --> G
    
    G --> H[Server / Client renders verified question list]
    H --> I[Displays Paper Code, Year, Question Number, Subject Badge]
```

---

## 5. Flowchart 4: Subject-Wise & Topic-Wise Practice

```mermaid
flowchart TD
    A[User visits /subjects or /topics] --> B[Select Subject: e.g., 'Polity & Governance']
    B --> C[Displays Topic Breakdown: Fundamental Rights, Parliament, Judiciary, Federalism]
    C --> D[User clicks 'Fundamental Rights']
    D --> E[Routes to /pyqs?subject=Polity&topic=Fundamental+Rights]
    E --> F[Fetches all historical PYQs mapped to that topic across 2011-2024]
    F --> G[Aspirant solves in Learn Mode alongside their textbook reading]
```

---

## 6. Flowchart 5: Learn Mode Question Interaction

```mermaid
flowchart TD
    A[Question Card Rendered] --> B[Shows Question Stem, Statements, and Options A, B, C, D]
    B --> C[Aspirant reads question and selects an option]
    C --> D{Is Option Correct?}
    D -->|Correct| E[Highlight Option Green with Checkmark Icon]
    D -->|Incorrect| F[Highlight Selected Option Red + Highlight Correct Option Green]
    
    E --> G[Unfold Pedagogical Accordion: 'Why this is correct']
    F --> G
    
    G --> H[Show 'Why other options are incorrect']
    H --> I[Show Official UPSC Answer Key Source citation]
    I --> J[Optionally add Private Note or Bookmark]
    F --> K[Background: Question automatically queued in 'Mistake Bank']
```

---

## 7. Flowchart 6: Timed Examination Mode (Strict UPSC Simulation)

```mermaid
flowchart TD
    A[User visits /mock-tests or selects Full Paper] --> B[Configure Test: GS Paper 1 (100 Q, 120 Min) or CSAT (80 Q, 120 Min)]
    B --> C[User clicks 'Start Examination']
    C --> D[Server creates TestSession in DB; Strips all Answer Keys]
    D --> E[Full Screen Exam Interface Launched]
    
    E --> F[Countdown Timer Starts in Header]
    E --> G[Question Navigation Palette shows: Answered (Green), Unanswered (Gray), Marked for Review (Purple)]
    
    G --> H[User selects option -> Response autosaved to local state & server sync]
    G --> I[User clicks 'Mark for Review and Next']
    
    H --> J{Timer reaches 00:00 OR User clicks 'Submit Test'?}
    I --> J
    
    J -->|Confirmation Modal| K[User confirms final submission]
    K --> L[POST /api/v1/tests/session/submit with response payload]
    L --> M[Server calculates: Total, Correct, Incorrect, Unattempted, Net Score]
    M --> N[Redirects to /mock-tests/result/:sessionId]
    N --> O[Displays Comprehensive Performance Scorecard & Unlocked Solutions]
```

---

## 8. Flowchart 7: Bookmark, Notes & Revision Flow

```mermaid
flowchart TD
    A[User logged in] --> B{Trigger}
    B -->|Clicks Bookmark Icon on any Question| C[POST /api/v1/user/bookmarks]
    B -->|Clicks 'Add Note'| D[POST /api/v1/user/notes with custom text]
    B -->|Made a Mistake in Learn/Exam Mode| E[System flags UserAttempt.isCorrect = false]
    
    C --> F[Added to /bookmarks]
    D --> G[Persisted on Question Card & /notes]
    E --> H[Added to /revision ('Mistake Revision Queue')]
    
    H --> I[User visits /revision to drill failed questions]
    I --> J[Re-attempt question]
    J --> K{Is Re-attempt Correct?}
    K -->|Yes| L[Marks question as 'Mastered' and increments retention score]
    K -->|No| M[Keeps in active revision cycle with next review timestamp]
```

---

## 9. Flowchart 8: User Registration & Session Management

```mermaid
flowchart TD
    A[User at /login or /login?signup=1] --> B{Form Input}
    B -->|New Registration| C[Enter Name, Email, Password]
    B -->|Existing User| D[Enter Email, Password]
    B -->|Demo Aspirant Quick-Login| E[One-Click Demo Aspirant]
    B -->|Demo Admin Quick-Login| F[One-Click Demo Admin]
    
    C --> G[Validate input & Hash Password with bcrypt]
    D --> H[Verify Credentials against User table]
    E --> I[Generate Secure Session Token]
    F --> I
    G --> I
    H --> I
    
    I --> J[Set HTTP-Only Secure Cookie]
    J --> K{Check User Role}
    K -->|ASPIRANT| L[Redirect to /dashboard]
    K -->|ADMIN| M[Redirect to /admin]
```

---

## 10. Flowchart 9: Learning Analytics & Performance Dashboard

```mermaid
flowchart TD
    A[User visits /dashboard] --> B[Fetch UserAttempt & UserResponse records for User ID]
    B --> C[Compute Overall Metrics: Total Attempts, Net Accuracy %, Study Hours]
    B --> D[Compute Subject Breakdown: Polity (84%), Economy (62%), Environment (48%)]
    B --> E[Identify 'Weak Areas': Topics with accuracy < 50%]
    B --> F[Fetch Active Revision Queue items]
    
    C --> G[Render Overview Stat Cards]
    D --> H[Render Interactive Subject Accuracy Bars]
    E --> I[Render 'Focus Areas' with direct link to practice those topics]
    F --> J[Render 'Quick Mistake Practice' card]
```

---

## 11. Flowchart 10: Admin Question Ingestion, Verification & Publication

```mermaid
flowchart TD
    A[Admin logs into /admin] --> B[Navigate to /admin/imports]
    B --> C[Upload JSON/CSV Question Batch or Enter Form]
    C --> D[Server executes schema validation & duplicate detection]
    
    D --> E{Validation Result}
    E -->|Errors Detected: Missing Options, Invalid Format| F[Reject Batch with detailed Line Error Report]
    E -->|Valid| G[Create questions in DB with status: 'NEEDS_REVIEW']
    
    G --> H[Admin navigates to /admin/review]
    H --> I[Admin reviews: Question Text, Options, Answer Key, Subject/Topic, Source Citation]
    I --> J{Admin Decision}
    J -->|Corrections Needed| K[Edit inline and save updates]
    J -->|Reject / Dubious| L[Change status to 'ARCHIVED']
    J -->|Verified Correct| M[Set status to 'VERIFIED']
    
    M --> N[Admin clicks 'Publish Verified Questions']
    N --> O[Status transitions to 'PUBLISHED']
    O --> P[Questions immediately live in Student Explorer & Search]
    P --> Q[AuditLog record written: timestamp, adminId, questionCount, paperYear]
```

---

## 12. Flowchart 11: Error and Recovery Flows

```mermaid
flowchart TD
    A[Network Drop or Server 500 during Exam Mode] --> B[Client-side Service Worker / LocalStorage captures state]
    B --> C[UI displays non-blocking banner: 'Connection lost. Your answers are safely stored locally.']
    C --> D[User continues answering questions locally]
    D --> E[Connection Restored]
    E --> F[Client syncs queued responses with server]
    F --> G[Submission proceeds safely without lost progress]
```

---

## 13. Flowchart 12: Plan Selection, Checkout & Payment Webhook Activation

```mermaid
flowchart TD
    A[User visits /pricing] --> B[User selects Billing Cycle: Monthly / Quarterly / Annual]
    B --> C[Prices dynamically update with computed discounts]
    C --> D{User selects Plan}
    D -->|Free Plan| E[Click 'Start Free Practice' -> Instant redirect to /pyqs]
    D -->|Beginner / Achiever / Scholar| F[Click 'Get Started' / 'Upgrade Now']
    
    F --> G{Is User Logged In?}
    G -->|No| H[Redirect to /login?redirect=/pricing]
    G -->|Yes| I[POST /api/v1/billing/checkout with planId & interval]
    
    I --> J[Server validates plan availability & calculates exact amount]
    J --> K[Creates PaymentRecord: PENDING + Generates Idempotency Key]
    K --> L[Displays Payment Confirmation & Checkout Sandbox/Gateway]
    
    L --> M{User Decision at Gateway}
    M -->|Cancels Checkout| N[PaymentRecord: CANCELLED; User returns to /pricing]
    M -->|Completes Payment| O[Gateway sends HTTP Webhook to POST /api/v1/billing/webhook]
    
    O --> P[Server verifies HMAC-SHA256 signature]
    P --> Q{Is Signature Valid?}
    Q -->|No| R[Return HTTP 401 Unauthorized]
    Q -->|Yes| S{Has Event ID already been processed?}
    S -->|Yes: Duplicate| T[Return HTTP 200 idempotent ignore]
    S -->|No: New Event| U[Record SubscriptionEvent in DB]
    
    U --> V[Transition PaymentRecord to SUCCEEDED]
    V --> W[Create/Update Subscription: status = ACTIVE, set currentPeriodEnd]
    W --> X[Immediate feature entitlement activation in /dashboard & /mock-tests]
```

---

## 14. Flowchart 13: Subscription Upgrade, Cancellation & Refund Policy

```mermaid
flowchart TD
    A[Subscribed User visits /pricing or Account Settings] --> B{Action Chosen}
    
    B -->|Upgrade Plan: e.g., Beginner to Achiever| C[Select new higher-tier plan & billing period]
    C --> D[POST /api/v1/billing/checkout -> Webhook updates Subscription planId]
    D --> E[Immediate access to Timed Exams & Unlimited Bookmarks]
    
    B -->|Cancel Auto-Renewal| F[Click 'Cancel Subscription' in Account]
    F --> G[System displays cancellation confirmation modal]
    G --> H[POST /api/v1/user/subscription/cancel]
    H --> I[Subscription updated: cancelAtPeriodEnd = true, status remains ACTIVE]
    I --> J[User keeps all paid features until currentPeriodEnd expires]
    J --> K[Upon expiry, system downgrades to FREE tier gracefully]
    
    B -->|Request 7-Day Refund| L[Contact support/admin within 7 days of initial purchase]
    L --> M[Admin reviews payment record & usage in /admin/subscriptions]
    M --> N[Admin approves refund -> Payment gateway refund API triggered]
    N --> O[RefundRecord stored in DB; Subscription status set to REFUNDED]
    O --> P[User receives refund within 5-7 business days]
```
