# PHASE 3: QUESTION DATA ARCHITECTURE & RELATIONAL SCHEMA
**Application:** Pravaah UPSC  
**Live Platform:** [https://pravaah-upsc.vercel.app/](https://pravaah-upsc.vercel.app/)  
**ORM:** Prisma Client v5.22.0  
**Database:** PostgreSQL 16 (Relational Multi-Stage Architecture)  
**Date:** November 23, 2026  

---

## 1. Architectural Philosophy

The Pravaah UPSC data architecture is engineered to guarantee:
1. **Unquestioned Academic Fidelity:** Every question references an official examination cycle, paper code, and official series booklet.
2. **True Bilingual Parity:** English and Hindi questions, options, and explanations are bound to a single canonical question entity without duplicating session attempts or user notes.
3. **Staged Publication Pipeline:** Questions never enter the student-facing catalog directly. They pass from raw text extraction to `QuestionStagingRecord`, through algorithmic validation, and finally require authorized administrative approval to be `PUBLISHED`.
4. **Format Extensibility:** Complete support for complex UPSC question topologies including multi-statement, match-the-following, assertion-reasoning, chronological sequences, and CSAT reading comprehension passages.

---

## 2. Entity-Relationship Topology

```
┌─────────────────────────────────────────────────────────────┐
│                       Exam / ExamStage                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ 1:N
┌──────────────────────────────▼──────────────────────────────┐
│                            Paper                            │
│  (code: "GS1", "GS2", positiveMark: 2.0, negativeMark: 0.666)│
└──────────────────────────────┬──────────────────────────────┘
                               │ 1:N
┌──────────────────────────────▼──────────────────────────────┐
│                           Question                          │
│  • id (CUID)                                                │
│  • paperId, year, questionNumber (Unique Composite Key)     │
│  • examCategory ("CSE", "CDS", "NDA", "EPFO")               │
│  • examStage ("PRELIMS", "MAINS")                           │
│  • questionFormat ("SINGLE_CHOICE", "MULTI_STATEMENT", etc) │
│  • questionText (Canonical)                                 │
│  • questionTextEn, questionTextHi                           │
│  • translationStatus ("HUMAN_VERIFIED", "ORIGINAL_SOURCE")  │
│  • verificationStatus ("OFFICIALLY_VERIFIED")               │
│  • status ("PUBLISHED", "VERIFIED", "NEEDS_REVIEW", "DRAFT")│
└──┬─────────────────┬────────────────────┬─────────────────┬─┘
   │ 1:4             │ 1:1                │ 1:N             │ 1:N
   ▼                 ▼                    ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│QuestionOption│  │ Explanation  │  │QuestionTopic │  │SourceCitation│
│• optionCode  │  │• summary     │  │  (Composite  │  │• evidenceType│
│• optionTextEn│  │• detailed    │  │   Topic Key) │  │• citationText│
│• optionTextHi│  │• explanationHi│ └──────────────┘  │• sourceUrl   │
│• isCorrect   │  │• citation    │                    └──────────────┘
└──────────────┘  └──────────────┘
```

---

## 3. Supported Question Topologies

| Format Code | Format Description | UPSC Prelims / CSAT Example |
| :--- | :--- | :--- |
| `SINGLE_CHOICE` | Direct factual or conceptual question with 4 mutually exclusive choices. | *"What is the remainder when (85 × 87 × 89...) is divided by 100?"* |
| `MULTI_STATEMENT` | Numbered factual statements (1, 2, 3...) evaluated with combination options. | *"Consider the following statements regarding the Indian Ocean Dipole... Which of the statements given above is/are correct?"* |
| `MATCH_FOLLOWING` | Two complementary lists (e.g., Wetland : State or Constitutional Article : Subject) paired together. | *"Match List-I (Constitutional Amendment) with List-II (Objective)..."* |
| `ASSERTION_REASONING`| Assertion (A) paired with Reason (R) with causation evaluation. | *"Assertion (A): Fiscal deficit leads to inflation. Reason (R): Deficit financing increases money supply."* |
| `CHRONOLOGY` | Historical events, dynasty reigns, or legislative acts arranged in temporal order. | *"Arrange the following historical events in chronological order of occurrence..."* |
| `COMPREHENSION` | Long passage followed by critical inference, crucial message, or assumption questions. | *"Passage on agrarian sustainability... Which one of the following statements best reflects the crucial message?"* |

---

## 4. Bilingual Translation Lifecycle

To eliminate fabricated translations while honoring non-English preparation:

| Translation Status Code | Description & Quality Boundary |
| :--- | :--- |
| `ORIGINAL_SOURCE` | The original source document was authored natively in this language (e.g. Official English or Hindi paper). |
| `HUMAN_VERIFIED` | Translated directly from the official bilingual UPSC question paper booklet or vetted by a bilingual faculty reviewer. |
| `MACHINE_TRANSLATED_REVIEW_REQUIRED`| Staged machine translation requiring academic faculty approval. **Strictly hidden from public catalog.** |
| `TRANSLATION_MISSING` | Language text is not yet available; system gracefully serves authentic original English text with clear label. |

---

## 5. Ingestion Staging Model (`QuestionStagingRecord`)

To enforce strict pre-publication review:
- Staged records are loaded into table `QuestionStagingRecord`.
- Every record is subjected to 10 automated quality checks:
  1. Option count exactly 4.
  2. Single valid correct answer key (`A`, `B`, `C`, or `D`).
  3. Non-empty pedagogical explanation.
  4. Duplicate check against existing `Question` records (`[paperCode, year, questionNumber, examCategory]`).
  5. Syllabus subject and topic mapping.
  6. Source document reference attachment.
- The `workflowStatus` field tracks progression:
  `IMPORTED` -> `EXTRACTION_COMPLETED` -> `AWAITING_VERIFICATION` -> `VERIFIED` -> `APPROVED_FOR_PUBLICATION` -> `PUBLISHED`.
- Only questions with status `APPROVED_FOR_PUBLICATION` can be promoted to the production `Question` table by an administrator.
