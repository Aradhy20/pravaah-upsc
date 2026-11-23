# Pravaah UPSC — Phase 5: Mistake Intelligence Lab Specification

**Endpoints:** `GET /api/v1/user/mistakes`, `POST /api/v1/user/mistakes`  
**Database Tables:** `UserMistakeClassification`, `ReviewSchedule` (PostgreSQL)  
**Status:** Implemented & Verified  

---

## 1. Overview & Pedagogical Purpose

The **Mistake Intelligence Lab** transforms incorrect responses from passive failures into structured learning catalysts. Rather than merely flagging questions as "wrong," aspirants categorize the psychological and conceptual root cause of their error:

1. `CONCEPT_NOT_UNDERSTOOD`: Fundamental theory or constitutional provision unclear.
2. `FORGOTTEN_FACT`: Retrieval failure on memory anchors (years, names, lists).
3. `MISREAD_QUESTION`: Oversight of qualifiers ("NOT correct", "all", "only").
4. `INCORRECT_ELIMINATION`: Misapplied heuristics or false assumptions about distractors.
5. `CONFUSED_TWO_OPTIONS`: Unable to isolate between the final two plausible choices.
6. `TIME_PRESSURE_CARELESS`: Hurried mark due to simulated exam pacing.

---

## 2. Closed-Loop SM-2 Spaced Repetition Integration

When a mistake is classified via `POST /api/v1/user/mistakes`:
1. A record is inserted into `UserMistakeClassification`.
2. The question is automatically queued into `ReviewSchedule` with an initial 1-day interval ($I_1 = 1$, Ease Factor $EF = 2.5$).
3. The SuperMemo-2 algorithm schedules subsequent reviews at 3 days, 7 days, 16 days, and 35 days upon successful resolution.
4. When a student demonstrates consistent correct recall, `isResolved` is set to `true`.

---

## 3. Targeted Pedagogical Interventions

Every mistake record generates a customized intervention path:
- **Concept Not Understood:** Directed to mapped NCERT chapter and standard book provisions.
- **Forgotten Fact:** Directed to factual review tables and comparative matrices.
- **Incorrect Elimination:** Directed to statement-by-statement evidence and qualifier identification strategies.
- **Time Pressure:** Directed to 5-question timed drills to train calibrated pacing.
