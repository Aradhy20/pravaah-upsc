# Firecrawl extraction workflow

## Batch sequence
1. Map UPSC official domain for question papers, archives, answer keys, exam calendar, syllabus, notifications, results and cut-offs.
2. Search official UPSC pages by exam family + year + paper name.
3. Scrape archive landing pages and extract every PDF URL and upload date.
4. For each PDF: download, compute SHA-256, record page count, OCR only if needed, retain original PDF.
5. Extract questions into JSONL/CSV with page and question number.
6. Match answer keys separately. Never merge coaching answers into official-key fields.
7. Repeat for Hindi versions; link language variants with question_group_id.
8. For each year/exam, mark PRESENT / NOT_PUBLISHED / NOT_FOUND / ACCESS_BLOCKED / NEEDS_MANUAL_REVIEW.
9. Run duplicate detection, OCR spot-checks, page-count checks and random question verification.
10. Export manifest and a coverage report.

## Current observed extraction blockers
- UPSC previous-question-paper and archive pages repeatedly returned connection-closed / automated scrape failures in the initial run.
- NCERT textbook catalogue was successfully read; it provides English and Hindi language selection and classes I–XII.
- NCERT states its textbooks are copyrighted and prohibits republication/redistribution; provide links rather than hosting copies.

## Firecrawl call guidance
Use map for URL discovery, search for missing years and exam families, scrape for individual landing pages/PDFs. Use small batches and preserve conversationId across calls. Do not mark a source complete merely because search snippets mention it.
