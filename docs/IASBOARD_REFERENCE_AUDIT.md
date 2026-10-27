# Pravaah UPSC — IASBoard Reference & Information Architecture Audit

**Auditor:** Senior Data Engineer, UX Researcher & UPSC Content Analyst  
**Document:** `docs/IASBOARD_REFERENCE_AUDIT.md`  
**Reference Target:** IASBoard (`https://www.iasboard.com/`)  
**Audit Purpose:** Functional and architectural reference inspection for UPSC Prelims PYQ explorer, filtering mechanics, question card layout, and compliance with data terms.

---

## 1. Compliance, Terms of Service & Data Signals Audit

Before inspecting any functional layout, we performed an automated compliance audit of IASBoard's public `robots.txt` and terms:

```http
# Extracted from https://www.iasboard.com/robots.txt
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
```

### Legal & Ethical Compliance Mandate:
1. **Zero Automated Scraping:** Under `Content-Signal: ai-train=no,use=reference` and Article 4 of EU Directive 2019/790, Pravaah UPSC does **NOT** scrape, replicate, or extract proprietary question copies, explanations, or user notes from IASBoard.
2. **Functional Reference Only:** IASBoard is analyzed solely as an information architecture and UX workflow reference (similar to benchmarking Airbnb for hotel booking UX).
3. **Primary Content Source:** All questions, options, paper series, and answer keys in Pravaah UPSC are strictly sourced from the **Union Public Service Commission (UPSC) official public archives** (`upsc.gov.in`).

---

## 2. Public Navigation & Information Architecture

IASBoard organizes its navigation into clear functional tracks:

```
IASBoard Top Navigation
├── Trackers (Syllabus tracker, daily sprint board)
├── GS Mains (Topic-wise questions, model answers, toppers copies)
├── Prelims
│   ├── Prelims PYQ Explorer (GS1 & CSAT)
│   ├── Year-wise Papers (2011–2024)
│   └── Subject / Topic Modules
├── NCERT (Chapter-wise practice)
├── Current Affairs (NewsCrux daily briefs)
├── Interview (Explorer & transcripts)
└── Pricing (Tiered monthly & annual plans)
```

### Core User Journey Benchmark:
- The search bar is prominently featured on the homepage with smart keywords (e.g., "Fiscal deficit", "Fundamental Rights", "Inclusive growth").
- Filter pills allow users to isolate Prelims PYQs vs GS Mains vs NCERT Practice.

---

## 3. Prelims PYQ Explorer & Filter Structure

### 3.1 Dual-Paper Architecture
UPSC Prelims consists of two mandatory papers:
1. **General Studies Paper I (GS1):** 100 questions, 200 marks, $+2.0 / -0.666$ marking. Focuses on History, Polity, Economy, Environment, Geography, and Science & Tech.
2. **General Studies Paper II (CSAT):** 80 questions, 200 marks, $+2.5 / -0.833$ marking, 33% qualifying threshold. Focuses on Quantitative Aptitude, Logical Reasoning, and Reading Comprehension.

IASBoard provides a clear toggle between **GS Paper I** and **CSAT Paper II**, which resets the available subject filters.

### 3.2 Multi-Dimensional Filter Hierarchy
The reference platform provides three levels of faceted filtering:
- **Year Range:** Multi-select or pill selector spanning 2011 to 2024.
- **Subject Categorization:** 
  - GS1: Polity, Economy, History & Art/Culture, Geography & Agriculture, Environment & Ecology, Science & Technology.
  - CSAT: Quantitative Aptitude, Logical & Analytical Reasoning, Reading Comprehension.
- **Micro-Topic Tagging:** Granular classification (e.g., `Polity -> Fundamental Rights & DPSP` or `Environment -> Protected Area Network`).
- **Difficulty & Type:** Filter by question difficulty (Easy, Medium, Hard) and format (Statement-based, Match-the-following, Assertion-Reasoning).

---

## 4. Question Card Behaviour & Learning Modes

In competitive UPSC preparation, students alternate between two distinct study mindsets:

| Feature / Dimension | Learn / Practice Mode | Timed Mock Exam Mode |
| :--- | :--- | :--- |
| **Pacing** | Untimed, exploratory | Strict 120-minute countdown timer |
| **Answer Feedback** | Immediate feedback on option selection | Zero feedback during exam (anti-leak) |
| **Option Elimination** | Strike-through / cross-out interactive tool | Standard radio button selection |
| **Explanations** | Comprehensive breakdown & elimination notes | Unlocked only after final submission |
| **Scoring** | Running accuracy percentage | Official UPSC fractional scoring breakdown |
| **Personalization** | One-click bookmarking & inline private notes | Review flag (`Mark for Review`) |

---

## 5. Architectural Implementation in Pravaah UPSC

Pravaah UPSC has implemented these proven workflows while introducing key improvements:
1. **Clean Academic Visual Design:** A light, high-contrast, distraction-free aesthetic with crisp typography and responsive layout.
2. **Server-Side Security:** Unlike client-side web apps that bundle answer keys in JavaScript, Pravaah UPSC's API strips answers in exam mode to prevent cheating.
3. **Exact UPSC Scoring Formulas:** Deterministic negative marking calculations ($+2.0 / -0.666$ for GS1 and $+2.5 / -0.833$ for CSAT).
4. **Rich Relational Model:** Normalized Prisma schema maintaining clear foreign-key relations between papers, subjects, topics, and source documents.
