# Pravaah UPSC — Phase 5: AI Personal Mentor Architecture

**Service Component:** Pravaah AI Personal Mentor  
**Endpoints:** `POST /api/v1/ai/mentor`, `GET/PUT /api/v1/user/preferences`  
**Underlying Retrieval Engine:** RAG Engine (`lib/services/rag-engine.ts`)  
**Status:** Implemented & Verified  
**Bilingual Support:** 100% English & Hindi Parity

---

## 1. Architectural Philosophy

The Pravaah AI Personal Mentor is designed specifically for UPSC Civil Services examination rigor. Unlike generic conversational chatbots, the mentor operates under strict pedagogical constraints:
1. **Grounded in Verified Truth:** All recommendations (PYQs, NCERT chapters, syllabus clauses) are retrieved directly from the PostgreSQL database. The AI never fabricates book chapters, syllabus provisions, or mock question keys.
2. **Performance-Aware Pacing:** The mentor reads the authenticated student's historical attempts (`UserAttempt`), active weak topics, and SM-2 revision queue before prescribing study blocks.
3. **Bilingual Parity:** Supports seamless English and Hindi (Devanagari) prompt understanding and response synthesis.
4. **Resilient Fallback Mode:** If external LLM providers or retrieval networks experience latency or downtime, the mentor executes deterministic rule-based heuristic generation, ensuring the student is never blocked.

---

## 2. Student Preferences & Onboarding Flow

Student preparation parameters are persisted in the `UserProfile` table via `GET/PUT /api/v1/user/preferences`:
- **Target Examination Year:** e.g., 2025, 2026, 2027.
- **Preparation Stage:** `BEGINNER`, `INTERMEDIATE`, `ADVANCED`.
- **Preferred Language:** `en` (English) or `hi` (Hindi).
- **Available Daily Study Hours:** Configurable commitment (e.g. 2h, 4h, 6h, 8h+).
- **Optional Subject:** e.g., Political Science & International Relations (PSIR), Sociology, Geography, History, Anthropology, Public Administration, or Deciding.
- **Strong Subjects:** Self-identified confidence pillars (stored as JSON array).
- **Weak Subjects:** Self-identified friction areas (stored as JSON array).

---

## 3. Dynamic Prompt & Retrieval Flow

```
[Student Query + Available Hours]
           │
           ▼
[Fetch UserProfile + UserAttempts + Weak Topics]
           │
           ▼
[RAGEngine.query() against Knowledge Database]
  ├── Official Syllabus Clauses (SyllabusNode)
  ├── 121 Verified Prelims Questions (Series A)
  ├── Official NCERT Textbooks (Classes 6–12)
  └── Standard Subject Authorities (Laxmikanth, Ramesh Singh, Shankar IAS)
           │
           ▼
[Personalized Schedule & Resource Synthesis]
  ├── Hourly Time-Blocked Study Schedule
  ├── Targeted NCERT Chapter Prescriptions
  ├── Verified PYQ Problem Recommendations
  └── SM-2 Mistake Queue Clearance Action
           │
           ▼
[Bilingual Output with Source Citations & Disclaimers]
```

---

## 4. Query Handling Example

### Scenario:
*Student Query:* `"Today I have only 4 hours. What should I study to improve my Polity and CSAT?"*

### Response Package:
1. **Time Allocation:**
   - **Session 1 (2h 00m):** GS Paper 1 Core Focus: Indian Polity — Parliament & Gubernatorial Powers (M. Laxmikanth Ch. 22 & NCERT Class 11 *Indian Constitution at Work* Ch. 4).
   - **Session 2 (1h 15m):** CSAT Paper 2 Drill: Quantitative Aptitude (Number Systems, Ratios) & 1 Long Reading Comprehension passage.
   - **Session 3 (0h 45m):** Active Recall: 5 Verified PYQs from 2024 Prelims Series A & Mistake Review.
2. **Weak Topic Interventions:** Cross-referenced against student accuracy in *Union & State Executive*.
3. **Citations:** M. Laxmikanth (7th Ed.), NCERT Class 11, UPSC CSE 2024 Prelims Paper 1 Series A.
4. **Bilingual Rendering:** Automatically adapts to English or Hindi based on language context.
