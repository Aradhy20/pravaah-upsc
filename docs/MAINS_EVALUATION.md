# PRAVAAH UPSC — MAINS ANSWER EVALUATION STUDIO

**Route:** `/mains`  
**API Endpoints:** `/api/v1/mains/questions`, `/api/v1/mains/submit`, `/api/v1/mains/evaluate`  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Standard:** UPSC CSE Mains GS Papers I–IV & Essay Structure

---

## 1. Principles of Mains Evaluation

Scoring in UPSC Mains is neither arbitrary nor purely subjective. Successful answers balance constitutional fidelity, analytical depth, multi-dimensional perspectives, and strict structural discipline within prescribed word limits (150 words for 10-mark questions, 250 words for 15-mark questions).

The **Pravaah Mains Answer Evaluation Studio** provides structured practice and evaluation governed by UPSC examiner rubrics, emphasizing that **model answers are non-prescriptive reference guides, not rigid formulas**.

---

## 2. The 4-Dimensional Evaluation Rubric

Every student submission is assessed across four standardized dimensions:

```
[ UPSC MAINS 4-DIMENSIONAL EVALUATION RUBRIC ]
                      │
  ┌───────────────────┼───────────────────┐
  │                   │                   │
[ 1. DEMAND ]       [ 2. CONTENT ]      [ 3. STRUCTURE ]
Addressing the      Multi-dimensional   Introduction,
core directive      evidence, data,     subheadings,
and all sub-parts   case laws, articles conclusion
  │                   │                   │
  └───────────────────┴───────────────────┘
                      │
            [ 4. PRESENTATION ]
            Flowcharts, maps,
            bullet points, legibility
```

### Rubric Breakdown:

1. **Demand of the Question (Weight: 30%):**
   - Did the candidate decode the directive verb (`Critically Examine`, `Evaluate`, `Discuss`, `Elucidate`)?
   - Did they address both the explicit and implicit sub-parts of the prompt?
2. **Substantive Content & Dimensions (Weight: 30%):**
   - Breadth across PESTLE dimensions (Political, Economic, Social, Technological, Legal, Environmental).
   - Concrete citations: Supreme Court judgments, Law Commission reports, NITI Aayog documents, economic statistics.
3. **Structure & Coherence (Weight: 25%):**
   - Crisp Introduction (defining key concepts or quoting a timely context).
   - Balanced Body Paragraphs with descriptive sub-headings.
   - Forward-looking, constitutional Conclusion (way forward aligning with SDGs or Constitutional ethos).
4. **Presentation & Word Limit Compliance (Weight: 15%):**
   - Visual enhancements: schematics, hub-and-spoke diagrams, mini-maps.
   - Word count adherence (penalizing answers exceeding $\pm 10\%$ of limit).

---

## 3. Disclaimers & Pedagogical Transparency

- **Non-Prescriptive Disclaimer:**
  > *"Notice: UPSC evaluation is nuanced and multi-faceted. Model answers provided on Pravaah UPSC represent one valid, high-scoring approach. Candidates are encouraged to develop their own authentic voice, diverse regional examples, and original arguments."*
- **Ethical Integrity (GS Paper IV):**
  - In ethics case studies, ethical frameworks (Utilitarianism, Deontology, Virtue Ethics, Constitutional Morality) must guide real-world administrative decision-making rather than abstract academic jargon.

---

## 4. UI Capabilities in `/mains`

- **Split-Screen Writing Studio:**
  - Left Panel: UPSC Question stem with Marks (10 / 15), Word Limit, Directive guide, and Syllabus Micro-Node.
  - Right Panel: Timed markdown text editor with real-time word counter and autosave.
- **Peer & Model Answer Comparator:**
  - Compare student draft against the curated model answer with synchronized side-by-side scrolling.
- **Rubric Self-Audit Matrix:**
  - Interactive self-assessment checklist before final submission.
