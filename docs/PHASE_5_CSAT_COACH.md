# Pravaah UPSC — Phase 5: Dedicated CSAT Survival Coach Specification

**Route:** `/csat-coach`  
**API Endpoint:** `/api/v1/csat/coach`  
**Status:** Implemented & Verified  
**Regulatory Standard:** Official UPSC CSE Preliminary Examination Paper-II Qualifying Rules

---

## 1. Executive Summary

UPSC Civil Services General Studies Paper II (CSAT) is a mandatory qualifying examination requiring **33% (66 / 200 marks)**. Failure to achieve this threshold results in immediate disqualification, regardless of the aspirant's score in General Studies Paper I.

The **Dedicated CSAT Survival Coach** provides real-time tracking against this 66-mark barrier, trains time management against the 90-second benchmark, and delivers targeted drills across the 3 core CSAT pillars.

---

## 2. Marking Scheme & Mathematical Telemetry

- **Total Questions:** 80
- **Total Paper Marks:** 200
- **Mark per Correct Answer:** $+2.5$
- **Negative Mark per Incorrect Answer:** $-0.833$ (one-third penalty)
- **Qualifying Cutoff:** $66.0$ Marks ($33.0\%$)

$$\text{Estimated CSAT Score} = \max\left(0, (\text{Correct Attempts} \times 2.5) - (\text{Incorrect Attempts} \times 0.833)\right)$$

### 2.1 Qualifying Status Classifications:
- **QUALIFYING_SAFE:** Estimated score $\ge 80.0$ (safe buffer $>14$ marks above cutoff).
- **QUALIFYING_MARGINAL:** Estimated score $66.0 - 79.9$ (danger zone, alert triggered).
- **AT_RISK:** Estimated score $< 66.0$ (urgent critical alert, below cutoff).
- **CALIBRATING:** $1 - 4$ attempts.
- **UNTESTED:** $0$ attempts.

---

## 3. The 3 Core CSAT Pillars

1. **Quantitative Aptitude:**
   - High-yield topics: Number System, Divisibility Rules, Ratios & Proportions, Percentages, Permutations & Combinations.
   - Pacing target: 100 seconds per question.
2. **Logical & Analytical Reasoning:**
   - High-yield topics: Syllogisms, Sequences & Series, Coding-Decoding, Seating Arrangements.
   - Pacing target: 80 seconds per question (high accuracy, minimal risk).
3. **Reading Comprehension:**
   - High-yield topics: Critical Inferences, Crucial Messages, Underlying Assumptions.
   - Pacing target: 90 seconds per passage.
