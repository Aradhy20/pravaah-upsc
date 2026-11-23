# PRAVAAH UPSC — PRELIMS READINESS ANALYTICS

**Route:** `/analytics`  
**API Endpoint:** `/api/v1/analytics/readiness`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Guiding Principle:** Objective, Empirical, Non-Delusional Readiness Assessment

---

## 1. The Anti-Delusion Philosophy

Commercial coaching institutes frequently provide vanity metrics (e.g., *"You are in the top 5%!"* or *"95% Chance of Clearing!"*) based on arbitrary unstandardized mock tests. This fosters false confidence followed by severe disappointment on UPSC results day.

Pravaah UPSC implements a mathematically rigorous, multi-factor **Prelims Readiness Index (0–100)** designed to reflect true examination preparedness without illusion or false flattery.

---

## 2. Mathematical Readiness Formula

The overall Readiness Score $R \in [0, 100]$ is computed as a weighted linear combination of four empirical pillars:

$$R = 0.35 \cdot S_{\text{GS1}} + 0.25 \cdot S_{\text{CSAT}} + 0.20 \cdot S_{\text{Syllabus}} + 0.20 \cdot S_{\text{SM2}}$$

Where:

### Pillar 1: GS Paper I Accuracy ($S_{\text{GS1}}$) — Weight: 35%
- Measured across the last 150 authentic UPSC Prelims GS1 question attempts.
- Formula:
  $$S_{\text{GS1}} = \min\left(100, \frac{\text{Correct}}{\text{Attempted}} \times 100\right)$$
- Benchmark: Realistic Prelims clearing accuracy is $65\% - 75\%$ on authentic UPSC papers (yielding 100–115 marks net after negative marking).

### Pillar 2: CSAT Score Alignment ($S_{\text{CSAT}}$) — Weight: 25%
- CSAT is qualifying (33% or 66.67 / 200 marks).
- Formula:
  $$S_{\text{CSAT}} = \min\left(100, \frac{\text{Net Estimated Marks}}{85} \times 100\right)$$
- An aspirant scoring 67 marks receives a low safety buffer score; 85+ marks scores 100% on this factor due to adequate margin of safety.

### Pillar 3: Syllabus Micro-Node Coverage ($S_{\text{Syllabus}}$) — Weight: 20%
- Proportion of active syllabus micro-nodes where the candidate has attempted at least 5 questions and reached `PRACTICED` or higher status.
- Formula:
  $$S_{\text{Syllabus}} = \frac{N_{\text{practiced}}}{N_{\text{total}}} \times 100$$

### Pillar 4: Spaced Repetition Retention Consistency ($S_{\text{SM2}}$) — Weight: 20%
- Adherence to the SM-2 review queue and successful retention of previously logged mistakes.
- Formula:
  $$S_{\text{SM2}} = \left(1 - \frac{\text{Overdue Unreviewed Revisions}}{\max(1, \text{Total Active Revisions})}\right) \times 100$$

---

## 3. Readiness Rating Bands

| Score Range | Classification | Status & Diagnostic Interpretation |
| :---: | :--- | :--- |
| **0 – 39** | `Foundational` | Beginning stage. Significant syllabus gaps and inconsistent practice. |
| **40 – 59** | `Emerging` | Basic concepts understood; high error rate in elimination and factual details. |
| **60 – 74** | `Competitive` | Serious contender. Capable of clearing on a favorable paper; needs error reduction. |
| **75 – 100** | `Exam Ready` | Consistently scoring above historical cutoffs across both GS1 and CSAT with strong retention. |

---

## 4. Subject-Level Deep Dive & Negative Marking Audit

The `/analytics` interface provides an empirical breakdown per subject:

- **Gross Correct vs Gross Incorrect:** Total positive marks gained vs marks penalized by $\frac{1}{3}$ negative deduction.
- **Net Accuracy Rate:** $\frac{\text{Net Marks Earned}}{\text{Total Maximum Marks}} \times 100$.
- **Time Taken per Question:** Identifies whether the candidate is rushing (<45 seconds) or stalling (>120 seconds).
- **Distractor Vulnerability Index:** Measures how often the candidate falls for trap options versus random guesses.
