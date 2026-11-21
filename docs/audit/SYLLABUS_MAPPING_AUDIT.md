# PRAVAAH UPSC – SYLLABUS & TOPIC MAPPING AUDIT REPORT
**Audit Executed:** November 21, 2026  
**Audited Entities:** `SyllabusNode`, `Subject`, `Topic`, `Subtopic`, `NCERTBook`, `NCERTChapter`  
**Mapping Junctions:** `QuestionSyllabusMapping`, `QuestionTopic`, `NCERTChapterQuestionLink`  
**Auditor:** Principal AI/RAG Engineer & Senior Curriculum Architect  

---

## 1. SYLLABUS HIERARCHY CENSUS

The platform uses a unified syllabus taxonomy linking official UPSC notifications with textbook pedagogy and AI retrieval embeddings.

| Hierarchy Level | Table Name | Record Count | Description |
| :--- | :--- | :---: | :--- |
| **Syllabus Nodes** | `SyllabusNode` | **53** | Prelims & Mains GS1–GS4 syllabus clauses |
| **Subjects** | `Subject` | **9** | Core disciplines (Polity, Economy, History, etc.) |
| **Topics** | `Topic` | **31** | Broad syllabus themes (Preamble, Fiscal Policy, etc.) |
| **Subtopics** | `Subtopic` | **0** | Fine-grained micro-topics (Unseeded) |
| **NCERT Books** | `NCERTBook` | **9** | NCERT Textbooks Classes 6–12 |
| **NCERT Chapters**| `NCERTChapter` | **44** | Individual chapters indexed for retrieval |

---

## 2. QUESTION-TO-SYLLABUS MAPPING ANALYSIS

### 2.1 Syllabus Coverage
- **Total Questions Evaluated:** 1,124
- **Questions Linked to Syllabus Nodes:** 1,123 (99.91%)
- **Unmapped Questions:** 1 question (0.09%)
- **Syllabus Node Distribution:**
  - `GS1-POLITY` / `GS1-GOV`: 214 mappings
  - `GS1-ECON`: 198 mappings
  - `GS1-ENV`: 186 mappings
  - `GS1-HIST`: 152 mappings
  - `GS1-SCI`: 144 mappings
  - `GS2-CSAT-REASONING`: 180 mappings
  - `GS2-CSAT-QUANT`: 49 mappings

### 2.2 Topic Mapping Coverage
- **Questions with Topic Links (`QuestionTopic`):** 1,080 questions (96.08%)
- **Questions Lacking Topic Links:** 44 questions (3.92%)
- **Topic Concentration:** The 31 topics are evenly distributed among modern history, constitutional framework, macroeconomic aggregates, and biodiversity.

### 2.3 The Subtopic Void
- **Finding:** The `Subtopic` table contains **0 records**.
- **Impact on SaaS:** When students attempt to filter or analyze their weak areas at the micro-concept level (e.g., distinguishing *Writ of Certiorari* vs *Writ of Prohibition* within Fundamental Rights), the system is forced to group everything under the macro-topic *Constitutional Framework*.
- **Remediation:** Ingest a standard UPSC taxonomy of ~250 subtopics across the 31 topics.

---

## 3. NCERT TEXTBOOK MAPPING DEFICIT

A core value proposition of Pravaah UPSC is grounding every PYQ in official NCERT textbook chapters to guide foundational reading.

### NCERT Mapping Status
| Dimension | Catalog Volume | Linked to Questions | Gap / Deficit |
| :--- | :---: | :---: | :---: |
| **NCERT Books** | 9 books | 9 books | 0 books unindexed |
| **NCERT Chapters** | 44 chapters | 8 chapters | 36 chapters unlinked |
| **Questions with NCERT Links** | 1,124 questions | **12 questions (1.07%)** | **1,112 questions (98.93%) lacking NCERT links** |

### Evaluation:
While the NCERT database tables (`NCERTBook` and `NCERTChapter`) are structured and populated with authentic textbook metadata (e.g. *Class 11 Indian Constitution at Work*, *Class 12 Themes in Indian History*), the association junction `NCERTChapterQuestionLink` only contains **12 records**.

Students browsing questions on the frontend currently see:
- *"NCERT Reference: Class 11 Political Science, Chapter 3"* for 12 questions.
- A blank or fallback citation for the remaining 1,112 questions.

---

## 4. ACTION PLAN FOR TAXONOMY ENRICHMENT

1. **Auto-Map NCERT Chapters via Embeddings:**
   Run an automated semantic matching script comparing `Question.questionText` + `Explanation.explanationText` against `NCERTChapter.title` + summary vectors to populate `NCERTChapterQuestionLink` for all questions.
2. **Populate Subtopic Table:**
   Execute a migration script defining 5–8 subtopics per topic to enable deep diagnostic analytics.
3. **Map the Single Unlinked Question:**
   Assign the remaining 1 unmapped question to its appropriate `SyllabusNode`.
