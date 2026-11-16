# Firecrawl extraction workflow

## Scope
Use Firecrawl to discover and index pages. Use official publisher/agency links for primary records. Keep extraction batches small and logged.

## Per-source process
1. Search for the official index page and archive pages.
2. Map the domain to discover year/paper/article URLs.
3. Scrape only relevant pages; for PDF question papers, parse the PDF and retain page references.
4. Extract metadata and source URLs first. Download binaries only where access and reuse rights permit.
5. For every question, preserve source page and question number; compare against official paper.
6. For answer keys, record provisional/final status and publication date.
7. For newspapers, extract headline/date/author/link and create original notes; do not reproduce full article text.
8. Store Hindi and English as separate fields; never invent a Hindi or English version if source translation is absent.
9. Run deduplication using exam + year + paper + question number + normalized text.
10. Export CSV/JSON/Parquet only after validation.

## Required run log columns
run_id, source_url, source_type, language, discovered_urls, fetched_pages, failed_pages, extracted_records, verified_records, rights_review, run_timestamp, notes
