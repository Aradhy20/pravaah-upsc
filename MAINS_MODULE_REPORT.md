# MAINS MODULE REPORT

**Platform:** Pravaah UPSC SaaS Platform  
**Feature:** Mains Practice Studio & AI Pedagogical Answer Evaluation  
**Route:** `/mains` & `/api/v1/mains/evaluate`  
**Audit Timestamp:** November 2026  
**Auditor:** Principal Full-Stack Architect & UPSC Academic Content Specialist  

---

## 1. Overview & Architectural Objectives

The Pravaah UPSC Mains Module provides an authentic examination workspace simulating the conditions of the UPSC Civil Services Main Examination. Aspirants can select from General Studies Papers I, II, III, IV (Ethics & Case Studies) and Essay, compose answers within calibrated time limits and word counts, conduct self-rubric reviews, and receive structured pedagogical feedback.

Following this audit and technical repair:
1. **Design System Integration:** The Mains Workspace at `/mains` is now fully integrated with global `<Header />` and `<Footer />` components, following the Indian heritage design palette (`bg-heritage-ivory`, `font-serif`, `border-heritage-border`, and `bg-heritage-burgundy`).
2. **UPSC Evaluation Framework:** Answer evaluation operates across the 4 core UPSC examination dimensions (Introduction & Contextual Definition, Multi-Dimensional Argumentation, Constitutional & Empirical Citations, Conclusion & Pragmatic Way Forward).
3. **Mandatory Pedagogical Disclaimer:** Every evaluation payload and UI scorecard includes a clear, explicit disclaimer emphasizing that the AI feedback is a diagnostic self-study rubric and not an official UPSC grading or guarantee.

---

## 2. Examination Formats & Word Limit Rules

The Mains workspace enforces standard UPSC Civil Services Examination formats:

| Format Code | Question Type | Max Marks | Prescribed Word Limit | Suggested Time Limit | Typical Allocation |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **GS-10M** | General Studies Short Answer | 10 Marks | 150 Words | 7–8 Minutes | 10 Questions / GS Paper |
| **GS-15M** | General Studies Long Answer | 15 Marks | 250 Words | 11–12 Minutes | 10 Questions / GS Paper |
| **ETHICS-20M** | GS IV Case Study / Extended | 20 Marks | 250–300 Words | 14–15 Minutes | 6 Questions / GS IV |
| **ESSAY-125M** | Philosophical / Thematic Essay | 125 Marks | 1000–1200 Words | 90 Minutes | 2 Essays / Essay Paper |

---

## 3. AI Pedagogical Evaluation Architecture

### 3.1 Dual-Engine Design (Gemini 1.5 + Offline Heuristic Engine)

The evaluation endpoint (`POST /api/v1/mains/evaluate`) features a resilient dual-engine architecture:

1. **Google Gemini 1.5 Flash:**
   When `GEMINI_API_KEY` is configured in the environment, the endpoint submits the student's answer, question stem, and official framework guidance to Gemini with structured JSON output enforcing the 4-dimension scoring schema.
2. **Offline Pedagogical Heuristic Engine:**
   When offline, in local development, or if the external API quota is exceeded, the server seamlessly falls back to a deterministic academic evaluation engine. This engine parses:
   - Word limit compliance (flagging `< 70%` as `UNDER` and `> 130%` as `OVER`).
   - Structural paragraph demarcation (Introduction, Body subheadings, Way Forward).
   - Thematic term coverage matching official syllabus guidelines.
   - Constitutional and institutional citation patterns (Articles, Acts, Supreme Court judgments, 2nd ARC, Law Commission).

### 3.2 Standard 4-Dimension Rubric Scoring

| Dimension | Weight | Max Score (10M Q) | Focus Area |
| :--- | :---: | :---: | :--- |
| **1. Introduction & Contextual Definition** | 15% | 1.5 Marks | Definition of core terms, context of the directive (Discuss, Critically Analyze, Elucidate). |
| **2. Multi-Dimensional Argumentation** | 50% | 5.0 Marks | Breadth across political, economic, social, technological, environmental, and legal aspects. |
| **3. Evidence, Citations & Case Laws** | 20% | 2.0 Marks | Specific articles, committee reports, statistics, and landmark precedents. |
| **4. Conclusion & Pragmatic Way Forward** | 15% | 1.5 Marks | Positive, constitutional, actionable synthesis and policy suggestions. |

---

## 4. Ethical Safeguards & Academic Disclaimers

To protect aspirants from false confidence and comply with truth-in-advertising guidelines, every evaluation response incorporates the following examiner disclaimer:

### English:
> *"Pravaah AI evaluation is an algorithmic diagnostic tool calibrated against official UPSC CSE rubrics (Intro, Body Dimensions, Empirical Evidence, Conclusion) to aid self-reflection. It does not replace human examiner subjectivity or guarantee UPSC marks."*

### Hindi:
> *"प्रवाह एआई मूल्यांकन एक शैक्षणिक स्व-मूल्यांकन रूब्रिक है जो मानक यूपीएससी मापदंडों पर आधारित है। यह वास्तविक परीक्षक की व्यक्तिगत दृष्टि का विकल्प नहीं है और अंकों की कोई औपचारिक गारंटी नहीं देता।"*

The response JSON explicitly includes:
```json
{
  "success": true,
  "evaluation": {
    "totalScore": 6.5,
    "dimensions": [...],
    "strengths": [...],
    "missingPoints": [...],
    "examinerDisclaimer": "Pravaah AI evaluation is an algorithmic diagnostic tool...",
    "isAiGeneratedEvaluation": true
  }
}
```

---

## 5. Verification Status

- [x] Header and Footer rendered on `/mains`.
- [x] Paper switcher toggles between GS1, GS2, GS3, GS4, and ESSAY.
- [x] Real-time word count updates dynamically as the student types.
- [x] Auto-saving of drafts to PostgreSQL (`mainsDraft` model) preserves user work.
- [x] Credit enforcement verified via `checkAiCreditAllowance(userId, "MAINS_EVALUATION")`.
- [x] Both Gemini and Heuristic fallback tested and operational.
