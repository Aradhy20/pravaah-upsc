# UPSC all-exam corpus starter kit

## What this package is

This is a source-backed corpus starter kit and local ingestion pipeline. It is **not** a completed 1-crore question bank and does not pretend that all UPSC question PDFs have already been extracted. It provides a searchable SQLite structure, seed source references and a builder that can index the full official UPSC resource registry, download selected source PDFs and produce reviewable question candidates.

## Official registry snapshot checked

As checked on **23 November 2026**, the official UPSC Previous Exam Details registry exposed:

- **240 exam records** (including Civil Services, Indian Forest Service, CDS, NDA, CAPF, CMS, ESE, Combined Geo-Scientist, IES/ISS and other UPSC examinations)
- Years represented: **2012-2027** (2027 items include future notices; they are not past-year questions)
- **2,101 question-paper PDF items** in the nested registry data
- **2,478 total document items** across question papers, answer keys, notices, results, cut-offs and other document types
- The registry's currently typed Answer Key category contained 10 item records, but not every record had a usable direct URL. The official registry therefore does not itself provide a complete answer key for every paper.

A separate independent discovery index, ParikshaIndex, stated that it lists **615 answer-key documents from 2011-2026** and links to UPSC-hosted files or archived copies. It is a third-party index, not an official UPSC source. Check every answer-key PDF's actual source before using it.

## Main official sources

- Previous Exam Details: https://cms.upsc.gov.in/previous-exam-details/
- Current question-paper archive: https://cms.upsc.gov.in/exam-documents/question-papers/
- Archived question-paper archive: https://cms.upsc.gov.in/archived-exam-documents/question-papers/
- Official previous-exam resource API referenced by the page: https://cms.upsc.gov.in/api/exam-resources/remaining

Answer-key discovery aid (third party): https://parikshaindex.com/upsc/answer-key/

## Run the searchable database builder

Use Python 3.10+ on a machine with internet access. The container used to prepare this kit did not have outbound DNS/network access, so the full live registry sync/download is designed to run on your computer.

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install requests pymupdf

python upsc_corpus_builder.py init
python upsc_corpus_builder.py sync
```

The `sync` command reads the official Previous Exam Details page and its linked public JSON endpoint. It indexes every exam/document URL returned by the live official registry into `upsc_pyq_searchable.sqlite`.

Download a small, selected batch first. Avoid downloading all PDFs in one go:

```bash
python upsc_corpus_builder.py download --exam "Civil Services (Preliminary) Examination, 2024" --year 2024 --max-downloads 10
python upsc_corpus_builder.py extract
python upsc_corpus_builder.py search "federalism"
python upsc_corpus_builder.py export-csv
```

The PDF parser uses text extraction. Scanned or low-text pages are marked for OCR/manual processing; OCR is not run automatically. Extraction heuristics are intentionally conservative and every question candidate is marked `extracted_candidate_needs_human_review`.


## Import answer keys, explanations and generated practice

Answer keys are not auto-guessed from question order. Fill `answer_key_import_template.csv` only after checking the actual answer-key PDF, exam, paper, question number and test booklet series. Save the completed file as `answer_key_import.csv`, then run:

```bash
python upsc_corpus_builder.py import-answer-keys --file answer_key_import.csv
```

For explanations, use `explanation_import_template.csv`. The allowed types are `teacher_written`, `ai_generated`, and `external_source_summary`. Save as `explanation_import.csv`, then run:

```bash
python upsc_corpus_builder.py import-explanations --file explanation_import.csv
```

For generated practice items, use `generated_practice_template.csv`, save the completed file as `generated_practice.csv`, and run:

```bash
python upsc_corpus_builder.py import-practice --file generated_practice.csv
```

Every imported practice row is forcibly labelled `GENERATED_PRACTICE_NOT_OFFICIAL_PYQ` and stored in `practice_questions`, separate from the official `questions` table.

## Data-integrity rules

1. **Official PYQs** come only from an identified UPSC question-paper document. The database stores the source PDF URL and document ID.
2. **Generated practice questions** live in a separate `practice_questions` table and must carry `GENERATED_PRACTICE_NOT_OFFICIAL_PYQ` as their content label.
3. Never mix AI-generated questions into official PYQ counts.
4. An official answer is attached only when the matching UPSC answer-key PDF is available and the test series, paper and question number match. Store source document IDs and review status.
5. Dropped/changed questions must be represented explicitly; do not quietly change the key.
6. Official answer-key PDFs usually provide keys, not pedagogical explanations. The `explanations` table distinguishes teacher-written, AI-generated and external-source summaries. AI explanations are not official and remain pending review until checked.
7. Keep raw PDF/source references. Do not label a source as verified merely because a third-party page lists it.
8. Do not re-publish bulk original PDFs without checking applicable UPSC website reuse/copyright conditions. This starter kit indexes official source links and stores selected files locally for personal research.

## Database tables

- `sources`: official source registries and explicitly labelled third-party discovery aids.
- `exams`: UPSC examination families and exam records.
- `documents`: paper, answer-key, result and notice documents with source URL and fetch status.
- `questions`: extracted PYQ candidates with A-D options and review status.
- `answer_keys`: answer values with paper/test-series provenance and verification status.
- `explanations`: teacher / AI / external explanations with separate provenance.
- `practice_questions`: generated practice only, never official PYQ.
- `document_pages`: extracted page text for searchable full-text review.
- `ingest_log`: sync/download/extraction run history.

SQLite FTS5 is used where available. The script also falls back to LIKE search if FTS5 is unavailable.

## Current seed database contents

The included `upsc_pyq_searchable.sqlite` contains 5 source records and four CSE Prelims 2024 GS-I, CSAT and answer-key document references. It has **no question, answer-key or explanation rows yet** because the PDF/key text has not been fully extracted and independently verified in this environment. Run `sync` on a networked machine to load the complete live document index; download/extract selected papers and manually review them before publication.
