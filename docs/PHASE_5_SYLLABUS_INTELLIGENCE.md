# Pravaah UPSC — Phase 5: Syllabus Intelligence Map Specification

**Route:** `/syllabus/intelligence`  
**API Endpoints:** `GET /api/v1/syllabus/intelligence`, `POST /api/v1/syllabus/intelligence`  
**Database Table:** `UserTopicProgress` (PostgreSQL)  
**Status:** Implemented & Verified  

---

## 1. Overview

The **UPSC Syllabus Intelligence Map** transforms the official abstract UPSC Civil Services syllabus into an interactive, 3-tier micro-node execution graph. Every topic is grounded in the proven 6-step mastery path:
$$\text{Read} \longrightarrow \text{Understand} \longrightarrow \text{Practice} \longrightarrow \text{Revise} \longrightarrow \text{Test} \longrightarrow \text{Master}$$

Students can visually inspect their progress across all General Studies Paper I and CSAT Paper II subjects, track micro-topic completion, and update their mastery status with real-time PostgreSQL persistence.

---

## 2. Information Architecture & Hierarchy

```
Exam Stage (PRELIMS / MAINS)
  └── Paper (GS1 / GS2 CSAT)
        └── Subject (e.g. Indian Polity & Governance)
              └── Topic (e.g. Fundamental Rights & DPSP)
                    ├── Subtopics (Articles 14–18, Right to Privacy, Writs)
                    ├── NCERT Chapter Mapping
                    ├── Standard Text References (Laxmikanth Ch. 7)
                    ├── Connected Historical PYQs (UPSC Series A)
                    ├── Mains Essay & Answer Writing Themes
                    └── Mastery Status (NOT_STARTED | LEARNING | PRACTISED | NEEDS_REVISION | MASTERED)
```

---

## 3. Five-Tier Topic Mastery State Machine

1. **NOT_STARTED (Default):** Student has not yet initiated study for this micro-topic.
2. **LEARNING:** Student has read foundational NCERT or standard text chapters.
3. **PRACTISED:** Student has solved historical PYQs and practice problems.
4. **NEEDS_REVISION:** Attempt telemetry indicates accuracy $< 60\%$ or retention decay under SuperMemo-2 interval.
5. **MASTERED:** Student has achieved verified conceptual mastery with consistent accuracy $\ge 75\%$.

---

## 4. API Specification

### 4.1 GET `/api/v1/syllabus/intelligence`
- **Authentication:** Optional (authenticated sessions include personalized mastery statuses; guest visitors see baseline tree).
- **Response Structure:**
  - `summary`: totalTopics, masteredCount, learningCount, practisedCount, needsRevisionCount, overallPercentage.
  - `subjects`: Array of subjects with paperCode, topicsCount, masteredCount, and nested topics.
  - `learningResources`: NCERT chapter citation, standard book reference, mains dimensions.

### 4.2 POST `/api/v1/syllabus/intelligence`
- **Authentication:** Mandatory (Bearer cookie / session).
- **Request Body:**
  ```json
  {
    "topicId": "cmvqr30n8000h5y3b9mnm98xz",
    "status": "MASTERED",
    "confidence": 0.85,
    "notes": "Reviewed Article 14-18 and recent affirmative action case laws."
  }
  ```
- **Database Action:** Upserts into `UserTopicProgress` with `@@unique([userId, topicId])`.
- **Response:** HTTP 200 with updated progress record.
