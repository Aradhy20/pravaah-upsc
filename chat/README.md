# Pravaah UPSC Master Library — starter pack

This is a structured source-and-ingestion starter folder, not a claim that the entire internet, every newspaper issue, or every historical paper has already been downloaded.

## Coverage target
- UPSC Civil Services Examination: Prelims, Mains, Essay, Optional papers, qualifying language papers, Personality Test/interview preparation.
- Other UPSC examinations can be included in `01_OFFICIAL_UPSC_PYQ/OTHER_UPSC_EXAMS` after confirming the intended exam list.
- English and Hindi folders are provided for bilingual notes and source indexing.
- Current affairs: daily/weekly/monthly notes with dated source links and original summaries.
- Newspaper coverage: article metadata, publisher link, date, headline, syllabus tags, and original short notes. Do not bulk-copy or redistribute full copyrighted newspaper articles/e-paper PDFs.

## Important rights and verification rules
1. Prefer original UPSC PDFs and official answer keys. Record exam, year, stage, paper, language, source URL, retrieval date, and checksum.
2. Secondary PYQ sites are discovery aids only. Verify question text against the official paper and answers against the official final key where available.
3. NCERT's official textbook site states that textbooks are copyrighted and prohibits republication/redistribution without permission. Keep official links and permitted metadata; do not mirror NCERT books in this folder unless permission/license allows it.
4. Newspapers are copyrighted. Do not scrape and redistribute complete issues/articles. Store links, bibliographic metadata, and independently written summaries/notes; access e-papers through publisher subscriptions.
5. Distinguish official answer key, provisional key, coaching answer, and editorially inferred answer. Never silently overwrite conflicting answers.
6. Do not mark a source as downloaded until the file exists, opens, and has been logged.

## Recommended data lifecycle
DISCOVER -> FETCH -> PARSE -> NORMALIZE -> DEDUPLICATE -> CLASSIFY -> VERIFY -> REVIEW RIGHTS -> EXPORT

## Folder guide
- `01_OFFICIAL_UPSC_PYQ`: official papers, grouped by stage/exam.
- `02_SYLLABUS_AND_NOTIFICATIONS`: current syllabus and exam notices.
- `03_NCERT`: English/Hindi subject/chapter reference index and permitted files.
- `04_CURRENT_AFFAIRS`: original bilingual notes and linked sources.
- `05_NEWSPAPER_INDEX`: metadata and original notes, not copied full articles.
- `06_GOVERNMENT_SOURCES`: PIB, reports, Budget, Economic Survey, ministry publications.
- `07_MAINS_ANSWER_WRITING`: questions, model answer drafts, evaluated practice.
- `08_INTERVIEW_PERSONALITY_TEST`: DAF themes, mock questions, current issues.
- `09_OPTIONAL_SUBJECTS`: optional syllabus and paper-wise resources.
- `10_DATASET_EXPORTS`: raw and cleaned structured records.
- `11_SOURCE_AND_LICENSE_LOG`: provenance, rights, and verification records.

## Suggested naming convention
`{exam}_{stage}_{year}_{paper}_{language}_{source}.pdf`
Example: `UPSC_CSE_PRELIMS_2024_GS1_BILINGUAL_UPSC.pdf`

## Suggested bilingual question record
See `question_record_schema.json`. Store English and Hindi question text separately, and retain the exact original wording. Do not machine-translate official wording and label it as official translation.

## Initial source catalogue
See `source_catalog.csv`. Links are discovery starting points, not proof that all listed content has been downloaded.
