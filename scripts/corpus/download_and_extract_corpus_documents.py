#!/usr/bin/env python3
"""
Downloads selected official UPSC question-paper / answer-key PDFs from the live registry,
computes SHA256 checksums, extracts page text with PyMuPDF, and stores pages in CorpusDocumentPage.
"""
import os
import sys
import time
import hashlib
import requests
import fitz
import psycopg2
from urllib.parse import urlparse

def load_env_db_url():
    env_path = os.path.join(os.path.dirname(__file__), '../../.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    val = line.split('=', 1)[1].strip().strip('"').strip("'")
                    return val
    return os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/pravaah_upsc')

DATABASE_URL = load_env_db_url()
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), '../../data/corpus_starter_kit/downloaded_pdfs')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.8'
}

def get_db():
    p = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        dbname=p.path.lstrip('/'),
        user=p.username,
        password=p.password,
        host=p.hostname or 'localhost',
        port=p.port or 5432
    )
    return conn

def download_and_extract(max_docs=5):
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    run_id = f"extract-pages-{int(time.time())}"
    cursor.execute("""
        INSERT INTO "CorpusIngestionJob" (id, "runId", action, status, "startedAt", note, "createdAt")
        VALUES (gen_random_uuid(), %s, 'BATCH_DOWNLOAD_AND_EXTRACT', 'RUNNING', NOW(), %s, NOW())
        RETURNING id;
    """, (run_id, f"Downloading up to {max_docs} official PDFs and extracting pages."))
    job_id = cursor.fetchone()[0]
    conn.commit()

    print(f"Starting batch download and page extraction job: {run_id}")

    # Select representative question papers from CSE, CDS, NDA, etc.
    cursor.execute("""
        SELECT id, "examName", year, paper, "documentType", "sourceUrl"
        FROM "CorpusDocument"
        WHERE "documentType" IN ('Question Paper', 'Answer Key')
          AND "sourceUrl" LIKE '%%.pdf'
          AND ("extractionStatus" = 'not_downloaded' OR "extractionStatus" = 'NOT_EXTRACTED' OR "extractionStatus" = 'PENDING')
        ORDER BY year DESC, id ASC
        LIMIT %s;
    """, (max_docs,))
    target_docs = cursor.fetchall()
    print(f"Targeting {len(target_docs)} official documents for processing.")

    processed = 0
    succeeded = 0
    failed = 0
    total_pages_extracted = 0

    session = requests.Session()
    session.headers.update(HEADERS)

    for doc_id, exam_name, year, paper, doc_type, source_url in target_docs:
        processed += 1
        print(f"\n[{processed}/{len(target_docs)}] Processing: {doc_id} ({exam_name} - {paper})")
        print(f"  URL: {source_url}")

        pdf_path = os.path.join(DOWNLOAD_DIR, f"{doc_id}.pdf")
        sha256_hash = ""
        content = None

        # 1. Download with rate limiting
        try:
            resp = session.get(source_url, timeout=45, stream=True)
            if resp.status_code != 200:
                raise ValueError(f"HTTP {resp.status_code}")
            content = resp.content
            if not content.startswith(b'%PDF'):
                raise ValueError("Response is not a valid PDF file")

            sha256_hash = hashlib.sha256(content).hexdigest()
            with open(pdf_path, 'wb') as f:
                f.write(content)
            print(f"  ✓ Downloaded {len(content)} bytes (SHA256: {sha256_hash[:12]}...)")
        except Exception as e:
            print(f"  ✗ Download failed: {e}")
            cursor.execute("""
                UPDATE "CorpusDocument"
                SET "extractionStatus" = 'DOWNLOAD_FAILED', note = %s, "updatedAt" = NOW()
                WHERE id = %s;
            """, (str(e), doc_id))
            conn.commit()
            failed += 1
            continue

        # 2. Extract page-by-page text
        try:
            pdf_doc = fitz.open(stream=content, filetype='pdf')
            num_pages = len(pdf_doc)
            print(f"  Opened PDF. Total pages: {num_pages}")

            usable_text_pages = 0
            low_text_pages = 0

            for pno in range(1, num_pages + 1):
                page = pdf_doc[pno - 1]
                raw_text = page.get_text('text') or ''
                char_count = len(raw_text.strip())
                quality = 'USABLE_TEXT' if char_count >= 80 else 'LOW_TEXT_NEEDS_OCR'
                if quality == 'USABLE_TEXT':
                    usable_text_pages += 1
                else:
                    low_text_pages += 1

                # Check language signals
                has_hindi = bool(any('\u0900' <= char <= '\u097F' for char in raw_text))
                has_english = bool(any('a' <= char.lower() <= 'z' for char in raw_text))

                cursor.execute("""
                    INSERT INTO "CorpusDocumentPage" (id, "documentId", "pageNumber", "pageText", "extractionQuality", "characterCount", "hasHindi", "hasEnglish", "createdAt")
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT ("documentId", "pageNumber")
                    DO UPDATE SET "pageText" = EXCLUDED."pageText",
                                  "extractionQuality" = EXCLUDED."extractionQuality",
                                  "characterCount" = EXCLUDED."characterCount",
                                  "hasHindi" = EXCLUDED."hasHindi",
                                  "hasEnglish" = EXCLUDED."hasEnglish";
                """, (doc_id, pno, raw_text, quality, char_count, has_hindi, has_english))
                total_pages_extracted += 1

            status = 'EXTRACTED_USABLE_TEXT' if usable_text_pages > 0 else 'SCANNED_NEEDS_OCR'
            cursor.execute("""
                UPDATE "CorpusDocument"
                SET "localPath" = %s,
                    "fileHashSha256" = %s,
                    "fileSize" = %s,
                    "extractionStatus" = %s,
                    note = %s,
                    "updatedAt" = NOW()
                WHERE id = %s;
            """, (
                pdf_path,
                sha256_hash,
                f"{len(content) / (1024*1024):.1f} MB",
                status,
                f"Extracted {num_pages} pages ({usable_text_pages} text, {low_text_pages} scanned/OCR needed).",
                doc_id
            ))
            conn.commit()
            succeeded += 1
            print(f"  ✓ Extracted {num_pages} pages. Status: {status}")

        except Exception as e:
            print(f"  ✗ Extraction failed: {e}")
            cursor.execute("""
                UPDATE "CorpusDocument"
                SET "extractionStatus" = 'EXTRACTION_FAILED', note = %s, "updatedAt" = NOW()
                WHERE id = %s;
            """, (str(e), doc_id))
            conn.commit()
            failed += 1

        time.sleep(1.0) # Polite rate limiting between downloads

    # Finish job
    job_status = 'COMPLETED' if failed == 0 else ('PARTIAL' if succeeded > 0 else 'FAILED')
    cursor.execute("""
        UPDATE "CorpusIngestionJob"
        SET status = %s, "finishedAt" = NOW(), "recordsSeen" = %s, "recordsAdded" = %s, errors = %s,
            note = %s
        WHERE id = %s;
    """, (
        job_status,
        len(target_docs),
        succeeded,
        failed,
        f"Processed {processed} documents. {succeeded} succeeded, {failed} failed. {total_pages_extracted} total pages indexed into CorpusDocumentPage.",
        job_id
    ))
    conn.commit()
    conn.close()

    print(f"\n=========================================")
    print(f"DOWNLOAD AND EXTRACTION RUN FINISHED")
    print(f"Processed: {processed} | Succeeded: {succeeded} | Failed: {failed}")
    print(f"Total Pages Indexed: {total_pages_extracted}")
    print(f"Job Status: {job_status}")
    print(f"=========================================\n")

if __name__ == '__main__':
    max_d = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    download_and_extract(max_d)
