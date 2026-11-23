# PRAVAAH UPSC — PYQ METADATA SCHEMA & DATA DICTIONARY

**Document Version:** 1.0.0  
**Target:** Relational & JSON Data Architecture  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**ORM:** Prisma 5.22.0 / PostgreSQL 15+

---

## 1. Overview

The Pravaah UPSC question bank architecture is engineered for multi-stage civil services examination datasets: Prelims (GS Paper I & CSAT), Mains (GS I–IV, Essay), and Personality Test (Interview Transcripts & DAF Prompts).

This document details the exact entity-relationship structure, data types, indexing strategies, and validation rules governing every question metadata field.

---

## 2. Prelims Question Schema (`Question`)

### Table: `questions`

| Field | Type | Nullable | Description | Validation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | No | Primary Key | `uuid_generate_v4()` |
| `stage` | `ExamStage` | No | Examination Stage | Default: `PRELIMS` |
| `paper` | `String` | No | Paper classification | `GS1`, `GS2` (CSAT) |
| `year` | `Int` | No | Year of examination | `1995 <= year <= 2026` |
| `questionNumber` | `Int` | No | Number in Booklet Series A | `1 <= questionNumber <= 100` |
| `bookletSeries` | `String` | No | Standard booklet series | Default: `A` |
| `subject` | `String` | No | Primary Subject | E.g., `Polity`, `Economy`, `History` |
| `topic` | `String` | No | Secondary Topic | E.g., `Fundamental Rights`, `Monetary Policy` |
| `subtopic` | `String` | Yes | Tertiary Micro-Node | E.g., `Article 21 & Privacy`, `Repo Rate Transmissibility` |
| `difficulty` | `Difficulty` | No | Cognitive difficulty | `EASY`, `MEDIUM`, `HARD` |
| `questionText` | `Text` | No | Primary English question stem | UTF-8, Markdown supported |
| `questionTextHi`| `Text` | Yes | Primary Hindi question stem | Devanagari Unicode |
| `options` | `Json` | No | Four options in English | Array of objects: `[{"id":"A","text":"..."},...]` |
| `optionsHi` | `Json` | Yes | Four options in Hindi | Array of objects: `[{"id":"A","text":"..."},...]` |
| `correctOption` | `String` | No | Official UPSC Key | One of `["A", "B", "C", "D"]` |
| `explanation` | `Text` | No | Pedagogical explanation | Comprehensive rationale + sources |
| `explanationHi`| `Text` | Yes | Hindi explanation | Optional bilingual context |
| `sourceUrl` | `String` | Yes | Primary PDF download URL | Official UPSC / Archive link |
| `verificationStatus` | `String` | No | Verification Tier | `OFFICIALLY_VERIFIED`, etc. |
| `status` | `PublishStatus` | No | Platform lifecycle | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `isDropped` | `Boolean` | No | Cancelled by UPSC in final key | Default: `false` |
| `createdAt` | `DateTime` | No | Creation timestamp | `now()` |
| `updatedAt` | `DateTime` | No | Last update timestamp | Auto-updated on write |

### Database Indexes:
```prisma
@@index([paper, year])
@@index([subject, topic])
@@index([status, verificationStatus])
```

---

## 3. Mains Question Schema (`MainsQuestion`)

### Table: `mains_questions`

| Field | Type | Nullable | Description | Validation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | No | Primary Key | `uuid_generate_v4()` |
| `stage` | `ExamStage` | No | Examination Stage | `MAINS` |
| `paper` | `String` | No | Paper classification | `GS1`, `GS2`, `GS3`, `GS4`, `ESSAY` |
| `year` | `Int` | No | Year of examination | `2013 <= year <= 2026` |
| `questionNumber` | `Int` | No | Question sequence number | `1 <= questionNumber <= 25` |
| `subject` | `String` | No | Primary GS Domain | E.g., `Governance`, `Ethics`, `Internal Security` |
| `topic` | `String` | No | Syllabus Topic | E.g., `Judiciary`, `Corporate Governance` |
| `marks` | `Int` | No | Total marks allocated | Standard: `10`, `15`, or `125` (Essay) |
| `wordLimit` | `Int` | No | Official word limit | Standard: `150`, `250`, or `1000–1200` |
| `questionText` | `Text` | No | English question stem | Includes directive word (e.g., "Critically examine") |
| `questionTextHi`| `Text` | Yes | Hindi question stem | Standard Devanagari translation |
| `directive` | `String` | Yes | Directive verb | `Discuss`, `Critically Analyse`, `Evaluate`, `Elucidate` |
| `modelAnswer` | `Text` | Yes | Structured Model Answer | Introduction + Body + Conclusion structure |
| `evaluationRubric` | `Json` | Yes | Multi-dimensional scoring | Core demand, Dimensions, Structure, Presentation |
| `sourceUrl` | `String` | Yes | Primary UPSC PDF link | Official portal source |

---

## 4. Map Feature Schema (`MapFeature`)

### Table: `map_features`

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | Primary Key | `cm...` |
| `name` | `String` | Official English Name | `Keibul Lamjao National Park` |
| `nameHi` | `String` | Official Hindi Name | `केइबुल लामजाओ राष्ट्रीय उद्यान` |
| `category` | `String` | Spatial Category | `NATIONAL_PARKS`, `WATERFALLS`, `STRAITS` |
| `stateOrRegion` | `String` | Administrative State / Geopolitical Sea | `Manipur`, `Red Sea / Gulf of Aden` |
| `latitude` | `Float` | Geographical Latitude | `24.5000` |
| `longitude` | `Float` | Geographical Longitude | `93.8500` |
| `description` | `Text` | UPSC Geographical Rationale | `World's only floating national park on Loktak Lake` |
| `pyqYears` | `Int[]` | Years tested in Prelims | `[2015, 2019, 2024]` |
| `importance` | `String` | Exam significance tier | `HIGH`, `CRITICAL` |

---

## 5. Interview / Personality Test Schema (`InterviewQuestion`)

### Table: `interview_questions`

| Field | Type | Description | Source Category |
| :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | Primary Key | Canonical identifier |
| `sourceType` | `String` | Categorization | `CANDIDATE_REPORTED`, `SITUATIONAL`, `DAF_THEME` |
| `category` | `String` | Thematic domain | `ADMINISTRATIVE_ETHICS`, `DISTRICT_CRISIS`, `DAF_HOMETOWN` |
| `questionText` | `Text` | English question prompt | Verbatim or reconstructed interview prompt |
| `questionTextHi`| `Text` | Hindi question prompt | Hindi equivalent |
| `context` | `Text` | Profile / Board Context | E.g., `Electronics Engineer from UP; Manoj Soni Board` |
| `framework` | `Text` | Civil Services Response Approach | Balanced constitutional & executive framework |
| `year` | `Int` | Civil Services Board Year | E.g., `2023` |
| `tags` | `String[]` | Tag taxonomy | `["Ethics", "Disaster", "SDM"]` |
