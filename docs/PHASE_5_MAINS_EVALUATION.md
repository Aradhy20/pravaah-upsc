# PHASE 5 — MAINS ANSWER EVALUATION ENGINE ARCHITECTURE

**Platform:** Pravaah UPSC  
**Component:** GS Mains Answer Writing Workspace & AI Pedagogical Evaluator  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary & UPSC Pedagogical Philosophy

Mains preparation is the decisive phase of the UPSC Civil Services Examination (1,750 marks across 7 papers). Aspirants routinely struggle not with content deficit, but with **structure, brevity, dimensional breadth, and strict adherence to word limits**.

Pravaah UPSC provides a dedicated, focused writing laboratory anchored to **32 authentic UPSC previous year Mains questions** (covering GS1, GS2, GS3, GS4 Ethics, and Essay).

The platform enforces a core pedagogical rule:
> **Zero Delusional Scoring:** Evaluative feedback is calibrated strictly against official UPSC CSE evaluation criteria. Clear disclaimers explicitly communicate that algorithmic feedback is a structural self-audit tool, avoiding synthetic guarantees of rank or marks.

---

## 2. 4-Dimension Evaluation Rubric

Every answer submitted through `/api/v1/mains/evaluate` is evaluated across 4 standardized UPSC dimensions:

| Dimension | Weight | Criteria & Focus |
| :--- | :--- | :--- |
| **1. Introduction & Contextual Definition** | 15% | Direct addressal of directive keyword (e.g. *Analyze, Critically Examine, Discuss*), 2-3 line crisp conceptual definition, recent constitutional or socio-economic context. |
| **2. Multi-Dimensional Argumentation (Body)** | 50% | Coverage of diverse facets: Constitutional, Legal, Economic, Administrative, Social, Environmental, and International relations. Use of structural headings and bullet points. |
| **3. Evidence, Citations & Value Additions** | 20% | Specific citation of Articles of the Constitution, Supreme Court judgements, Law Commission recommendations, 2nd ARC reports, NITI Aayog policy documents, and Economic Survey data. |
| **4. Conclusion & Pragmatic Way Forward** | 15% | Forward-looking, balanced synthesis adhering to constitutional values (preamble, DPSPs) with actionable policy recommendations. |

---

## 3. Word Limit Compliance Logic

Official UPSC answer booklets provide strict rectangular space limits corresponding to word limits (typically 150 words / 10 marks or 250 words / 15 marks).

Pravaah UPSC applies non-linear compliance factors:
- **Optimal (±15% of limit):** Full score eligibility.
- **Under-length (<70% of limit):** Multiplier penalty of 0.75x reflecting superficiality.
- **Over-length (>130% of limit):** Multiplier penalty of 0.85x reflecting time-management failure and risk of incomplete papers in examination conditions.
- **Minimum Threshold:** Submissions below 30 words are rejected immediately with a friendly pedagogical prompt.

---

## 4. Dual-Engine Evaluation Architecture

To ensure high availability in production, the evaluation pipeline utilizes a resilient two-tier architecture:

```
                  ┌───────────────────────────────┐
                  │ Student Submits Mains Draft   │
                  └──────────────┬────────────────┘
                                 │
                   Check process.env.GEMINI_API_KEY
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
           [Key Available]                 [Key Absent /
                 │                          API Failure]
                 ▼                               │
    ┌─────────────────────────┐                  ▼
    │ Google Gemini 1.5 Flash │    ┌─────────────────────────┐
    │ Structured JSON Prompt  │    │ Deterministic Heuristic │
    │ (Strict 4-Dimension)    │    │ Pedagogical Rule Engine │
    └────────────┬────────────┘    └─────────────┬───────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │ Upsert `MainsDraft` in DB     │
                 │ Record Activity Telemetry     │
                 │ Render Interactive Scorecard  │
                 └───────────────────────────────┘
```

1. **Primary Model (Gemini 1.5 Flash):** When `GEMINI_API_KEY` is present, answers are evaluated using a structured JSON prompt adhering to official UPSC examiner guidelines and framework themes.
2. **Local Deterministic Fallback Engine:** When external APIs are unavailable or rate-limited, an authentic heuristic engine runs locally. It parses keyword density against editorial themes, counts distinct paragraph demarcations, identifies structural subheadings, checks for statutory citations, and computes the 4-dimension breakdown.

---

## 5. Aspirant Self-Audit Workflow

The user interface (`/mains`) integrates four complementary practice tools:
1. **Interactive Timer:** Measures speed per word and pacing against the real 7-to-11-minute per-question exam window.
2. **Live Word Counter:** Highlights green (optimal), red (over-limit), or slate (drafting).
3. **Self-Audit Checklist:** 4 quick toggles (Introduction, Multi-dimensional body, Citations, Way forward) that foster critical meta-cognition prior to AI evaluation.
4. **Self-Evaluation Slider:** Enables students to rate their own confidence out of 10/15 marks, fostering self-calibration against the AI rubric.

---

## 6. Official Disclaimer & Ethical Guardrail

Every AI evaluation output prominently features the following persistent disclaimer:
> *"Pravaah AI evaluation is an algorithmic diagnostic tool calibrated against official UPSC CSE rubrics (Intro, Body Dimensions, Empirical Evidence, Conclusion) to aid self-reflection. It does not replace human examiner subjectivity or guarantee UPSC marks."*
