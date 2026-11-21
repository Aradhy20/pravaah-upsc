# PRAVAAH UPSC — PRELIMS PYQ DATABASE SCHEMA & ENTITY MAPPING
**Document Reference:** `DOCS-PYQ-SCHEMA-002`  
**Database Engine:** PostgreSQL 17 (Docker Container: `pravaah-db`)  
**ORM:** Prisma 5.22.0  

---

## 1. ENTITY RELATIONSHIP ARCHITECTURE

The PYQ architecture links Examination Hierarchy, Bilingual Question Entities, 24-Subject Academic Taxonomy, Official Verification Keys, and Student Attempt Telemetry:

```mermaid
erDiagram
    Exam ||--o{ ExamStage : contains
    ExamStage ||--o{ Paper : includes
    Paper ||--o{ Question : conducts
    Question ||--|{ Option : has_four
    Question ||--o{ QuestionAnswer : verified_by
    Question ||--o| QuestionExplanation : pedagogically_explained
    Question ||--o{ Citation : backed_by
    Question ||--o{ SyllabusMapping : maps_to
    Subject ||--o{ Topic : contains
    Subject ||--o{ Question : classifies_direct
    Topic ||--o{ Question : classifies_direct
    Topic ||--o{ QuestionTopic : joins_m_to_n

    Question {
        string id PK
        string paperId FK
        int year
        int questionNumber
        string questionType "MCQ"
        string questionText
        string questionTextEn
        string questionTextHi
        string difficulty "EASY|MEDIUM|HARD"
        float marks "2.0 GS1, 2.5 CSAT"
        float negativeMarks "0.666 GS1, 0.833 CSAT"
        string status "PUBLISHED|VERIFIED|DRAFT"
        string subjectId FK
        string topicId FK
    }

    Option {
        string id PK
        string questionId FK
        string optionCode "A|B|C|D"
        string optionText
        string optionTextEn
        string optionTextHi
        boolean isCorrect
    }

    QuestionAnswer {
        string id PK
        string questionId FK
        string answerOption "A|B|C|D"
        string answerKeyType "UPSC_FINAL_KEY"
        string answerProvenance "UPSC_OFFICIAL_FINAL"
        string verificationStatus "OFFICIALLY_VERIFIED"
        datetime publishedAt
    }

    QuestionExplanation {
        string id PK
        string questionId FK
        string summary
        string detailedExplanation
        string explanationEn
        string explanationHi
        string eliminationTechnique
        string sourceCitation
    }
```

---

## 2. DIRECT FOREIGN KEYS & QUERY ACCELERATION

To guarantee sub-15ms filtering across 30 years of questions, `Question` maintains direct foreign keys alongside M:N taxonomy tables:

- **`Question.subjectId`**: Direct FK to `Subject.id` indexed via `@@index([subjectId])`.
- **`Question.topicId`**: Direct FK to `Topic.id` indexed via `@@index([topicId])`.
- **Composite Unique Index**: `@@unique([paperId, year, questionNumber])` strictly prevents accidental duplication of any question in the same paper and year.
- **Year & Status Index**: `@@index([year, status])` powers instant year pill retrieval.

---

## 3. MARKING SCHEME METRICS

| Examination Paper | Correct Mark (`marks`) | Negative Penalty (`negativeMarks`) | Penalty Fraction | Passing Threshold |
|---|---|---|---|---|
| **GS Paper 1 (GS1)** | `+2.00` | `-0.666` | 1/3rd of positive | Cut-off based merit (~85–100) |
| **GS Paper 2 (CSAT / GS2)** | `+2.50` | `-0.833` | 1/3rd of positive | Qualifying 33% (66.67 / 200) |

---

## 4. FIELD-BY-FIELD MAPPING SPECIFICATION

| Client Interface Field | Database Source Column | Table | Transformation / Fallback |
|---|---|---|---|
| Question Stem (English) | `questionTextEn` | `Question` | Fallback to `questionText` |
| Question Stem (Hindi) | `questionTextHi` | `Question` | Rendered when language mode = HI or BOTH |
| Option Code | `optionCode` | `Option` | "A", "B", "C", "D" |
| Option Text (English) | `optionTextEn` | `Option` | Fallback to `optionText` |
| Option Text (Hindi) | `optionTextHi` | `Option` | Devanagari text |
| Official UPSC Key | `answerOption` | `QuestionAnswer` | Verified against UPSC final master key |
| Elimination Technique | `eliminationTechnique` | `QuestionExplanation` | Highlights logical trap & elimination heuristics |
| Detailed Explanation | `detailedExplanation` | `QuestionExplanation` | Multi-paragraph conceptual rationale |
| Academic Subject | `name` | `Subject` | Joined via `Question.subjectId` |
| Academic Topic | `name` | `Topic` | Joined via `Question.topicId` |
| Reference Citation | `citationText` / `sourceName`| `Citation` | Official gazette or textbook reference |
