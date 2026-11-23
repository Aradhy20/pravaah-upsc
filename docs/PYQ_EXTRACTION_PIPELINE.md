# MASTER PYQ EXTRACTION PIPELINE — PRAVAAH UPSC

**Platform:** Pravaah UPSC  
**Component:** Automated Data Engineering, Parsing & Ingestion Pipeline  
**Reference Document:** `Pravaah_UPSC_Master_PYQ_Bank_Blueprint.pdf`  
**Status:** SPECIFICATION IMPLEMENTED & TESTED  

---

## 1. 12-Step Production Pipeline Architecture

The Pravaah UPSC question-bank ingestion engine converts raw government PDFs into queryable, bilingual, relational records through a 12-stage sequential pipeline:

```
[Official UPSC Portal] ──(Step 1: Ingest)──> Raw PDF Vault
                                                  │
                                          (Step 2: SHA-256)
                                                  │
                                          (Step 3: Text Extract)
                                                  │
                                          (Step 4: OCR Fallback)
                                                  │
                                          (Step 5: Question Demarcation)
                                                  │
                                          (Step 6: Deduplication Gate)
                                                  │
                                          (Step 7: Taxonomy Classifier)
                                                  │
                                          (Step 8: PDF Proof Check)
                                                  │
                                          (Step 9: Bilingual Pairing)
                                                  │
                                          (Step 10: Official Key Matching)
                                                  │
                                          (Step 11: Staging Quality Gate)
                                                  │
                                          (Step 12: Production Indexing)
                                                  │
                                                  ▼
                                      [PostgreSQL Question Bank]
```

---

## 2. Pipeline Execution Stages

### Stage 1: Official Ingestion & SHA-256 Vaulting
- Automated fetchers query UPSC live directories (`https://www.upsc.gov.in/examinations/previous-question-papers`) and archives.
- Original source files are stored in `data/official_upsc_pdfs/{year}/{paper}_{series}.pdf`.
- SHA-256 cryptographic hashes are computed and recorded in `QuestionSource.checksum` to guarantee tamper-proof provenance.

### Stage 2: Dual-Stream Text Extraction (Digital vs Scan)
- **Primary:** Native digital text extraction (`pdfjs-dist` / `pdf-parse`) extracts font streams, preserving Unicode symbols, superscripts, and mathematical notation.
- **Secondary (OCR Fallback):** For scanned pre-2010 booklets, OCR (`Tesseract.js` with Devanagari and English traineddata) runs at 300 DPI with binarization filtering.

### Stage 3: Question & Option Demarcation
- Regular expression parsers detect Series A numbering patterns (`^\d+\.\s+`, `^Q\.\s*\d+`).
- Extracts exactly four options labelled `(a)`, `(b)`, `(c)`, `(d)` or `A`, `B`, `C`, `D`.
- Retains original source page numbers (`sourcePage`) and paper question numbers (`questionNumber`).

### Stage 4: Duplicate Detection & Signature Hashing
- Computes normalized character n-gram fingerprints from lowercase, punctuation-stripped question stems.
- Checks against existing records in `Question` and `QuestionStagingRecord` to prevent re-ingesting duplicate questions across booklet variants or mock scrapes.

### Stage 5: Subject & Micro-Topic Taxonomy Classification
- Assigns examination stage (`PRELIMS`, `MAINS`, `INTERVIEW`).
- Maps question to the 6 Prelims General Studies pillars (History, Geography, Polity, Economy, Environment, Science & Tech) or the CSAT sub-pillars.
- Links to micro-nodes defined in `prisma/schema.prisma` (`Topic`, `Subtopic`).

### Stage 6: Human Verification & Quality Gate
- Extracted records enter `QuestionStagingRecord` with verification status `UNVERIFIED` or `OCR_CHECKED`.
- An administrative or editorial reviewer compares the parsed text against the original PDF snapshot.
- Changes status to `HUMAN_REVIEWED` once verified.

### Stage 7: Bilingual Alignment & Translation Provenance
- Pairs English stems with their authentic Devanagari counterpart from the official dual-language paper.
- If an official Hindi counterpart does not exist in the source booklet, reviewed human translation is applied and tagged `translationStatus: "HUMAN_VERIFIED"`. Silent machine translation is strictly prohibited.

### Stage 8: Official Key Attachment & Publication
- Correct option codes are attached **only when matched against an officially released UPSC final answer key PDF**.
- Verification status transitions to `OFFICIALLY_VERIFIED`.
- Record is published to production (`status: "PUBLISHED"`).
