# Pravaah UPSC — User-Provided Sources Extraction

Extraction date: 16 November 2026
Scope: the five URLs supplied by the user, with publicly accessible page content and linked-resource discovery.

## Important scope note
This is a structured extraction of the supplied landing pages and a first-pass set of publicly discoverable linked resources. It is **not** a complete mirror of every page on those domains, nor does it contain every question, paid course, PDF, topper copy or newspaper article. A complete site-wide crawl requires iterative batches and may encounter pagination, sign-in, robots, rate limits or copyright restrictions.

## Resolved URLs
1. https://iasboard.com/ — shared link 1
2. https://currentaffairs.decodecivils.com/ — shared link 2 (CAShorts / Decode Civils)
3. https://humanperitus.in/ — shared link 3
4. https://www.unlockias.in/upsc-exams-other-than-cse — direct link 4
5. https://examday.ai/ — shared link 5

## Main findings
- IASBoard: CSE Prelims and Mains PYQ workspaces, other-exam PYQs, syllabus mapping, current affairs, topper-copy index, NCERT workspace, optionals and interview explorer.
- Decode Civils CAShorts: dated current-affairs cards, GS/syllabus tags, five practice MCQs per story, daily quizzes, revision, and monthly/topic archives.
- Human Peritus: UPSC-linked preparation pages include EPFO, legal exams, SO Grade B LDCE, Assistant Director Census, DRDO/store officer, Accounts Officer, ALC/LEO, ESIC Deputy Director, CSAT and interview preparation. Also has non-UPSC UGC NET/teaching/PSU resources; those are separated in the catalogue.
- UnlockIAS: other UPSC exam PYQs (NDA/CDS/CAPF and EPFO), IFoS papers, CSE Prelims PYQ index, Mains PYQ index, syllabus, answer-copy resources and state-PCS pages. Treat provider answers as secondary unless matched to official keys.
- ExamDay: Prelims practice, current affairs, Mains practice/evaluation, learning modules, PYQ pages, optional-subject question pages and English/Hindi routes.

## Copyright and access
The package stores source links, taxonomy, concise original summaries and metadata. It does not republish entire paid courses, complete newspaper articles, protected coaching PDFs, or proprietary platform databases. Use each provider's own access and terms for restricted material. Verify all questions and answers against official UPSC papers and official final answer keys before importing them into a public question bank.

## Recommended Pravaah ingestion design
- Preserve `source_name`, `source_url`, `retrieved_at`, `content_type`, `exam`, `year`, `stage`, `paper`, `subject`, `topic`, `language`, `rights_status`, and `verification_status`.
- Store official papers and official answer keys separately from third-party transcriptions and explanations.
- Link English/Hindi variants through a shared `question_group_id`; do not label machine translations as official.
- Store current affairs as metadata + URL + original Pravaah summary + syllabus tags.
