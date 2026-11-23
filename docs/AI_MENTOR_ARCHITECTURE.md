# PRAVAAH UPSC — AI PERSONAL MENTOR ARCHITECTURE

**API Route:** `/api/v1/ai/mentor`  
**User Preferences Route:** `/api/v1/user/preferences`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Design Principle:** Grounded RAG + Deterministic Heuristic Fallbacks + Anti-Hallucination Guardrails

---

## 1. Overview & Pedagogical Mandate

The Pravaah UPSC AI Mentor acts as a 24/7 personal academic guide for civil services aspirants. Unlike generic conversational chatbots that offer vague or potentially hallucinated advice, the Pravaah AI Mentor operates under strict disciplinary guardrails:

1. **Grounded in Official Syllabus:** Every recommendation is mapped directly to UPSC CSE Prelims or Mains syllabus nodes.
2. **Standard Reference Citations:** Guidance must reference standard civil services source materials:
   - NCERT textbooks (Classes IX–XII)
   - Indian Polity by M. Laxmikanth
   - A Brief History of Modern India (Spectrum / Rajiv Ahir)
   - Certificate Physical and Human Geography (G.C. Leong)
   - Ramesh Singh / Sanjiv Verma / Nitin Singhania for Indian Economy
   - Ministry Annual Reports, Economic Survey, and Union Budget
3. **Deterministic Heuristic Fallback:** If upstream LLM APIs (e.g., Gemini or OpenAI) experience rate limits, network latency, or downtime, the system fails over seamlessly to a rule-based expert heuristic engine.

---

## 2. System Architecture

```
[ Aspirant Query / Mentor Action Request ]
                     │
                     ▼
       [ /api/v1/ai/mentor Controller ]
                     │
    ┌────────────────┴────────────────┐
    ▼                                 ▼
[ User Context Aggregator ]     [ Intent Classifier ]
- Target Exam Year (2025/2026)  - Study Plan Request
- Language Mode (EN / HI)       - Doubt Resolution
- Weak Topics (Mistake Lab)     - Revision Strategy
- Optional Subject              - Daily Schedule Advice
    │                                 │
    └────────────────┬────────────────┘
                     ▼
           [ Prompt Synthesizer ]
   - Strict Grounding Constraints
   - Standard Textbook Anchor Citations
   - UPSC Marking Scheme Rules
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  [ External LLM ]       [ Heuristic Fallback Engine ]
  (Gemini 1.5 Pro)       - Deterministic study schedules
  (JSON Structured)      - Subject-specific high-yield tips
         │               - Revision cadence calculators
         └───────────┬───────────┘
                     ▼
          [ Response Sanitizer ]
   - Strips non-standard terminology
   - Enforces Hindi Devanagari parity
   - Emits structured JSON response
```

---

## 3. Data Schema & Contracts

### Request Payload (`POST /api/v1/ai/mentor`):
```json
{
  "query": "How should I structure my preparation for Modern History over the next 3 weeks?",
  "language": "EN",
  "subject": "Modern History",
  "userContext": {
    "targetYear": 2025,
    "currentAccuracy": 62.5,
    "weakTopics": ["Governor Generals", "Tribal Uprisings"]
  }
}
```

### Response Payload:
```json
{
  "status": "success",
  "advice": "### 3-Week Modern History Strategic Framework\n\n**Week 1: Foundations & 1857 Revolt**\n- Core Sources: NCERT Class XII *Themes in Indian History Part III*, Spectrum Chapter 5–8.\n- Key Focus: British expansionist policies (Doctrine of Lapse, Subsidiary Alliance).\n\n**Week 2: National Movement & Socio-Religious Reforms**\n- Core Sources: Spectrum Chapters 9–18.\n- Focus on Tribal & Peasant uprisings (Santhal, Munda, Indigo Revolt) which feature prominently in Prelims PYQs.\n\n**Week 3: Gandhian Era to Independence (1915–1947)**\n- Round Table Conferences, Government of India Acts 1919 and 1935.\n- Practice 50 PYQs from 2011–2024 to calibrate elimination technique.",
  "recommendedTopics": ["Tribal and Peasant Movements", "Acts of 1919 and 1935"],
  "standardSources": [
    "Spectrum: A Brief History of Modern India by Rajiv Ahir",
    "NCERT Class XII: Themes in Indian History (Part III)"
  ],
  "engine": "GROUNDED_AI_ENGINE"
}
```

---

## 4. Anti-Hallucination & Safety Guardrails

- **Zero Fabricated Questions:** The mentor is strictly prohibited from generating simulated or synthetic questions claiming to be "UPSC official questions".
- **Disclaimers:** The mentor explicitly reminds students that UPSC is unpredictable and no single source is exhaustive.
- **Language Parity:** All guidance is available in both English and formal Hindi, ensuring Hindi-medium aspirants receive equal pedagogical quality.
