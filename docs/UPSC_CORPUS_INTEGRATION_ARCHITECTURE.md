# UPSC Master Corpus Integration Architecture

**Platform:** Pravaah UPSC SaaS (`https://pravaah-upsc.vercel.app/`)  
**Database:** PostgreSQL 16 (via Prisma ORM 5.22.0)  
**Environment:** Next.js 14 App Router + Node.js 20 ESM  
**Date:** November 2026  
**Lead Architect:** Aradhy Jain (+91 7351522153, jainaradhy123@gmail.com)

---

## 1. Executive Summary

The **Pravaah UPSC Master Question Bank Corpus** integrates the official Union Public Service Commission (UPSC) Previous Exam Details registry directly into the existing Pravaah SaaS PostgreSQL architecture. Rather than relying on unverified third-party scrapes or inflating question counts with AI-generated text, Pravaah maintains an official, source-backed registry covering **241 examination cycles** and **2,461 official documents** spanning all major UPSC examination families from 2012 to 2027.

```mermaid
flowchart TD
    subgraph UPSC_CMS["Official UPSC CMS Registry"]
        A1["cms.upsc.gov.in/previous-exam-details/"]
        A2["cms.upsc.gov.in/api/exam-resources/remaining"]
    end

    subgraph Starter_Kit["Corpus Starter Kit (Local Ingestion Engine)"]
        B1["upsc_corpus_builder.py"]
        B2["upsc_pyq_searchable.sqlite"]
        B3["PyMuPDF (fitz) Text Extractor"]
    end

    subgraph Production_DB["PostgreSQL Production Database"]
        C1["CorpusSource (5 Sources)"]
        C2["CorpusExam (241 Exams)"]
        C3["CorpusDocument (2,461 Documents)"]
        C4["CorpusDocumentPage (Extracted Text)"]
        C5["QuestionStagingRecord (Staged Candidates)"]
        C6["Question (Official Verified PYQs)"]
        C7["GeneratedPracticeQuestion (Isolated Practice)"]
        C8["CorpusIngestionJob (Audit Trail)"]
    end

    subgraph API_Layer["Next.js SaaS REST APIs"]
        D1["GET /api/v1/corpus/documents"]
        D2["GET /api/v1/corpus/exams"]
        D3["GET /api/v1/corpus/search"]
        D4["GET /api/v1/corpus/practice"]
        D5["GET /api/v1/admin/corpus"]
    end

    A1 -->|Harvest| B1
    A2 -->|Sync JSON| B1
    B1 -->|Populate| B2
    B2 -->|Prisma Sync Pipeline| C1 & C2 & C3
    C3 -->|Download & PyMuPDF| C4
    C4 & Starter_Kit -->|Parse & Validate| C5
    C5 -->|Faculty Promote| C6
    API_Layer -->|Query & Search| Production_DB
```

---

## 2. Relational Schema & Entity Architecture

The integration introduces 6 dedicated models into `prisma/schema.prisma` without breaking any existing student records, attempts, billing models, or bookmarks:

```mermaid
erDiagram
    CorpusSource ||--o{ CorpusExam : indexes
    CorpusSource ||--o{ CorpusDocument : references
    CorpusExam ||--o{ CorpusDocument : contains
    CorpusDocument ||--o{ CorpusDocumentPage : has_pages
    CorpusDocument ||--o{ Question : source_of
    QuestionStagingRecord ||--o| Question : promotes_to
    GeneratedPracticeQuestion {
        string practiceId
        string contentLabel
        string questionText
        string answerLetter
        string explanation
    }
    CorpusIngestionJob {
        string runId
        string action
        string status
        int recordsAdded
    }
```

### Key Models

1. **`CorpusSource`**: Registry sources (e.g. `UPSC_PREVIOUS_EXAM_DETAILS`, `UPSC_QUESTION_PAPERS_CURRENT`, `UPSC_QUESTION_PAPERS_ARCHIVE`).
2. **`CorpusExam`**: 241 examination instances across 11 examination families (CSE, CDS, NDA, IFoS, ESE, CAPF, CMS, CGS, IES/ISS, CISF LDCE, Other).
3. **`CorpusDocument`**: 2,461 official PDF records categorized into Question Papers (2,103), Cut-off Marks (180), Recommended Marks (85), Notices (33), Results (39), Answer Keys (6), and Reserve Lists (15).
4. **`CorpusDocumentPage`**: Page-level extracted text indexed by PyMuPDF, recording text character counts, extraction quality (`USABLE_TEXT` vs `LOW_TEXT_NEEDS_OCR`), and language detection (Hindi vs English).
5. **`QuestionStagingRecord`**: Safe candidate holding area where extracted questions are validated, checked for 4 options (A-D) and official answer keys, before publication.
6. **`GeneratedPracticeQuestion`**: Strictly isolated table for AI-generated practice questions with mandatory `contentLabel = 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'`.
7. **`CorpusIngestionJob`**: Persistent audit log recording all sync, download, extraction, staging, and import operations with exact counts, errors, and execution timings.

---

## 3. Data Flow & Ingestion Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant UPSC as UPSC CMS (Live)
    participant Sync as sync_corpus_to_postgres.ts
    participant Extractor as download_and_extract_corpus_documents.py
    participant Staging as stage_verified_pyq_corpus.py
    participant DB as PostgreSQL
    participant App as Next.js API

    Sync->>UPSC: Read SQLite / CMS Registry
    Sync->>DB: Upsert 5 Sources, 241 Exams, 2,461 Documents
    Extractor->>UPSC: Stream Selected Question Paper PDF
    Extractor->>Extractor: Validate %PDF header & compute SHA256
    Extractor->>DB: Write CorpusDocumentPage (Page Text + Quality)
    Staging->>Staging: Parse Question Stem, Options A-D, Official Key
    Staging->>DB: Insert QuestionStagingRecord (workflowStatus='VERIFIED')
    App->>DB: Serve /api/v1/corpus/documents & /api/v1/corpus/search
```

---

## 4. Operational Safety & Resilience

1. **Zero Schema Collisions**: All corpus models are namespaced with the `Corpus` prefix (`CorpusSource`, `CorpusExam`, `CorpusDocument`, `CorpusDocumentPage`, `CorpusIngestionJob`).
2. **Rate-Limited Resumable Ingestion**: Live downloads implement courteous delays (1.0s) and timeout handling to comply with UPSC website server guidelines.
3. **Conservative Scanned PDF Handling**: Scanned documents with low text densities are flagged as `SCANNED_NEEDS_OCR` without guessing or hallucinating question text.
4. **Audit Logging**: Every automated operation records a unique `runId` and updates status in `CorpusIngestionJob`.
