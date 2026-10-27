# UI/UX Design Brief & Design System Specification
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Design Lead:** Antigravity UI/UX Design & Human Interface Systems  

---

## 1. Design Philosophy & Brand Positioning

### 1.1 Philosophy: "Calm, Academic Rigor"
Preparing for the Civil Services Examination requires immense cognitive stamina. Aspirants spend 8 to 12 hours a day reading dense texts. Our visual design philosophy rejects flashiness, gamified distractions, flashy casino animations, and visual noise in favor of:
- **Maximum Readability:** Generous line heights, crisp typography, and optimal character count per line ($65\text{--}80$ characters).
- **Cognitive Clarity:** Information hierarchy prioritizing the question stem and the analytical options.
- **Dignified Restraint:** A clean, light academic aesthetic inspired by university libraries, premium scholarly monographs, and official gazettes, featuring serene neutrals, subtle slate borders, and a confident royal navy/sapphire blue accent.

### 1.2 Brand Identity: "Pravaah"
- **Meaning:** "Pravaah" denotes constant, steady, effortless flow—the disciplined continuity required for UPSC mastery.
- **Brand Promise:** "Find the PYQ. Understand the concept. Learn from every mistake."
- **Distinction from References:** Unlike IASBoard (which uses cream/sand themes with heavy purple/indigo gradients and commercial banners) or Human Peritus (which uses green/orange themes focused on commerce recruitment), Pravaah is an uncluttered, authoritative, open scholarly learning environment.

---

## 2. Design Tokens & Styling System

### 2.1 Color Palette

```
  Neutral Canvas:
  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
  │  Canvas Base    │  Card Surface   │  Muted Border   │  Subtle Divider │
  │  #F8FAFC (slate)│  #FFFFFF (white)│  #E2E8F0 (border│  #F1F5F9 (slate) │
  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘

  Primary Brand (Academic Sapphire & Navy):
  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
  │  Brand Light    │  Brand Primary  │  Brand Dark     │  Brand Deep     │
  │  #EFF6FF (50)   │  #2563EB (blue) │  #1D4ED8 (700)  │  #0F172A (navy) │
  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘

  Academic Feedback (Pedagogical Semantics):
  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
  │  Success Base   │  Success Tint   │  Error Base     │  Error Tint     │
  │  #16A34A (green)│  #F0FDF4 (bg)   │  #DC2626 (red)  │  #FEF2F2 (bg)   │
  ├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
  │  Warning/Review │  Warning Tint   │  CSAT Accent    │  CSAT Tint      │
  │  #D97706 (amber)│  #FFFBEB (bg)   │  #0D9488 (teal) │  #F0FDFA (bg)   │
  └─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### 2.2 Typography Hierarchy
- **Primary Font Family:** Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Monospace Font Family:** JetBrains Mono, "Courier New", monospace (for question codes, question numbers, timers).

| Role | Font Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display 1** | 2.5rem (40px) | 800 (Bold) | 1.15 | Homepage Hero Headline |
| **Heading 1** | 1.875rem (30px) | 700 (Bold) | 1.25 | Page Titles (Explorer, Mock Tests) |
| **Heading 2** | 1.25rem (20px) | 600 (Semi-bold) | 1.35 | Section Headers, Subject Titles |
| **Question Stem** | 1.0625rem (17px)| 500 (Medium) | 1.65 | Question body text & statements |
| **Option Text** | 0.9375rem (15px)| 400 (Regular) | 1.55 | Multiple-choice options A/B/C/D |
| **Explanation** | 0.875rem (14px) | 400 (Regular) | 1.60 | In-depth concept notes & analysis |
| **Metadata Tag** | 0.75rem (12px)  | 600 (Semi-bold) | 1.20 | Badges: Year, Subject, Difficulty |

---

## 3. Spacing System & Responsive Breakpoints

- **Base Unit:** 4px grid. Standard spacing: 4px (`p-1`), 8px (`p-2`), 12px (`p-3`), 16px (`p-4`), 24px (`p-6`), 32px (`p-8`), 48px (`p-12`), 64px (`p-16`).
- **Breakpoints:**
  - `sm`: 640px (Mobile landscape / large phones)
  - `md`: 768px (Tablets portrait)
  - `lg`: 1024px (Tablets landscape / small laptops)
  - `xl`: 1280px (Standard desktops)
  - `2xl`: 1536px (Large monitors)

---

## 4. Component Inventory & Interaction Rules

### 4.1 Question Card Component (`QuestionCard`)
- **Card Container:** White background, 1px border `#E2E8F0`, rounded corners (12px), subtle shadow on hover (`shadow-sm`).
- **Header:**
  - Left: Exam badge (`UPSC CSE Prelims`), Paper badge (`GS Paper 1` in Blue / `CSAT` in Teal), Year (`2024`), Question Index (`Q.42`).
  - Right: Bookmark toggle button (heart/star icon with active fill), Notes button (reveals inline editor), Share icon.
- **Body:**
  - Question text rendered with crisp serif/sans clarity.
  - Numbered statements (1, 2, 3...) formatted with indentation.
  - Final lead-in question: *"Which of the statements given above is/are correct?"* in semi-bold.
- **Options (A, B, C, D):**
  - Interactive radio-style button, minimum height 48px, rounded 8px.
  - In Learn Mode: Upon selection, immediately animates with subtle 150ms border and background transition to reveal Correct (Emerald) or Incorrect (Crimson).
- **Pedagogical Explanation Drawer:**
  - Appears smoothly after an option is picked or when "Show Explanation" is toggled.
  - Sections:
    1. **Core Concept & Answer Summary**
    2. **Detailed Statement Analysis (Why statement 1 is correct, Why statement 2 is incorrect)**
    3. **Official UPSC Reference & Context**
    4. **Related Syllabus Topic Link**

### 4.2 Timed Examination Player (`ExamPlayer`)
- **Fixed Sticky Header:**
  - Left: Paper name, Total marks, Question tracker (`Question 14 of 100`).
  - Center: High-contrast digital countdown timer (`01:42:18`). Changes to amber when $< 15$ mins, red pulsing when $< 5$ mins.
  - Right: Quick Help & "Submit Paper" button with confirmation modal.
- **Split Layout:**
  - Main Panel (Left / Center): Current question with large touch-friendly options, Clear Choice, and "Mark for Review" toggle.
  - Navigation Palette (Right / Slide-over Drawer on Mobile): 100-number grid with status indicators:
    - Gray: Unvisited
    - Red/Orange: Visited but Unanswered
    - Green: Answered
    - Violet: Marked for Review
    - Violet with Green Dot: Answered & Marked for Review

### 4.3 Diagnostic Dashboard (`DashboardView`)
- **Metrics Ribbon:** 4 key cards (Total Practiced, Net Accuracy %, Speed per Question, Revision Queue count).
- **Subject Mastery Bar Graph:** Visual horizontal bars showing accuracy percentage per subject with target cutoff guideline.
- **Weak Topic Action Center:** Identifies specific syllabus nodes requiring attention (e.g., "Fiscal Policy: 38% accuracy across 12 attempts") with a 1-click "Practice This Topic" button.

---

## 5. Accessibility, States & Dark Mode

- **WCAG 2.1 AA Compliance:** Minimum 4.5:1 text-to-background contrast ratio on all readable surfaces. Focus outlines (`focus-visible:ring-2 focus-visible:ring-blue-600`) explicitly defined for keyboard navigation.
- **Empty & Error States:** All empty search and filter states provide actionable recommendations (e.g., "No questions found for this combination — Try clearing the year filter or searching related topics").
- **Dark Mode Strategy:** The default theme is an academic light mode designed for day-long study. The system provides a seamless CSS variables-based dark theme (`dark:bg-slate-950`, `dark:text-slate-100`, `dark:border-slate-800`) that respects user preference or manual toggle without color inversion artifacts.

---

## 6. Pricing Page UI/UX Specification (`/pricing`)

### 6.1 Layout & Visual Architecture
The Pricing Page adheres strictly to our calm academic design language while driving transparent decision-making:

1. **Hero Header & Value Proposition:**
   - Display Title: *"Transparent, Purpose-Built Plans for Serious UPSC Aspirants"*
   - Subtitle: *"Start free with public PYQs. Upgrade only when you need full exam simulation, weak-topic analytics, and unlimited revision queues."*
   - Honest Messaging: Prominently states that core PYQ discovery is permanently free, with zero hidden trial traps.

2. **Billing Period Selector:**
   - Centered segmented pill control (`bg-slate-100 p-1 rounded-xl inline-flex`).
   - Toggles: **Monthly**, **Quarterly** *(Save 15%)*, **Annual** *(Save 35% Best Value)*.
   - Smooth animated active state highlight with instant client-side price recalculation.

3. **Tier Card Layout & Distinction:**
   - 4-column responsive grid on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`).
   - **Tier 0: Free (Aspirant Foundation)** — Neutral border, transparent background, *"Start Free Practice"* CTA.
   - **Tier 1: Beginner (Syllabus Sprint)** — Light blue accent, outlines key note-taking expansion.
   - **Tier 2: Achiever (Prelims Pro)** — **Highlighted / Recommended Tier**:
     - Distinctive deep blue border (`ring-2 ring-blue-600 shadow-md`).
     - Top pill badge: *"Most Popular / Aspirant Choice"*.
     - High-contrast Navy CTA button: *"Get Started with Achiever"*.
   - **Tier 3: Scholar (Ranker Suite)** — Royal indigo tint, caters to multi-year revision and advanced rankers.

4. **Dynamic Price Presentation:**
   - Currency symbol (₹) with large bold numerical price (e.g., `₹799`, `₹1,899`, `₹5,499`).
   - Suffix label clearly defining the billing cycle (`/ month`, `/ quarter`, `/ year`).
   - Subtext displaying renewal terms and standard GST inclusion notice.

5. **Detailed Feature Comparison Matrix:**
   - Full responsive table comparing all 4 plans across 8 dimensions (Question Library, Timed Simulation, Quotas, Diagnostics, Notes, Bookmarks, Revision, Support).
   - Visual indicators: Emerald checkmarks (`✓`), Slate dashes (`—`), and exact numeric quotas (`5`, `50`, `Unlimited`).

6. **Frequently Asked Questions (FAQ) Accordion:**
   - 6 high-priority questions addressing billing periods, payment security, cancellation procedure, refund rules, and access retention.
   - Clean keyboard-accessible disclosure elements with smooth chevron rotation.

7. **Security & Guarantee Trust Banner:**
   - Shield badge highlighting 256-bit encrypted checkout, zero card storage on servers, and a 7-day money-back guarantee.
