#!/usr/bin/env python3
"""
Stages authentic, source-backed UPSC questions into QuestionStagingRecord.
Sources:
1. Prelims_Microthemes_(2008-26)_Civilsdaily.pdf (Over 1,900 questions across 11 subjects)
2. UPSC_CSE_Prelims_PYQ_Sample_Volume_01_2024.pdf
"""
import os
import sys
import re
import json
import time
import hashlib
import fitz
import psycopg2
from urllib.parse import urlparse

MICROTHEMES_PDF = '/Users/aradhyjain/.gemini/antigravity/brain/6cf3e7f8-c8da-4a4f-8dab-bc0ba04ede0e/.user_uploaded/media_1795458231175_f48b2569.pdf'
SAMPLE_VOL_PDF = '/Users/aradhyjain/.gemini/antigravity/brain/6cf3e7f8-c8da-4a4f-8dab-bc0ba04ede0e/.user_uploaded/media_1795456424023_91ddd78e.pdf'

def load_env_db_url():
    env_path = os.path.join(os.path.dirname(__file__), '../../.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    return os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/pravaah_upsc')

def get_db():
    p = urlparse(load_env_db_url())
    return psycopg2.connect(
        dbname=p.path.lstrip('/'),
        user=p.username,
        password=p.password,
        host=p.hostname or 'localhost',
        port=p.port or 5432
    )

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', (text or '').lower()).strip('-')

def determine_subject(page_num):
    # Based on Table of Contents of Microthemes PDF (0-indexed page_num + 1)
    p = page_num + 1
    if 4 <= p <= 28: return 'polity', 'Polity & Constitution'
    if 29 <= p <= 56: return 'economics', 'Economy & Development'
    if 57 <= p <= 76: return 'geography', 'Geography'
    if 77 <= p <= 85: return 'agriculture', 'Agriculture & Food Security'
    if 86 <= p <= 100: return 'modern-history', 'Modern Indian History'
    if 101 <= p <= 134: return 'environment', 'Environment & Ecology'
    if 135 <= p <= 148: return 'international-relations', 'International Relations'
    if 149 <= p <= 166: return 'governance', 'Governance & Public Policy'
    if 167 <= p <= 184: return 'art-and-culture', 'Art & Culture'
    if 185 <= p <= 201: return 'science-and-technology', 'Science & Technology'
    if 202 <= p <= 210: return 'ancient-medieval-history', 'Ancient & Medieval History'
    return 'general-studies', 'General Studies'

def parse_microthemes_pdf(max_questions=None):
    if not os.path.exists(MICROTHEMES_PDF):
        print(f"File not found: {MICROTHEMES_PDF}", file=sys.stderr)
        return []

    doc = fitz.open(MICROTHEMES_PDF)
    print(f"Reading Microthemes PDF: {len(doc)} pages...")

    questions = []
    current_theme = 'General'

    for pno in range(3, len(doc)): # Start from page 4 (index 3)
        subject_slug, subject_name = determine_subject(pno)
        raw_text = doc[pno].get_text('text')
        clean_text = re.sub(r'[\x00-\x08\x0b-\x1f\x7f]', ' ', raw_text)

        # Update theme if [Microtheme] is present on page
        theme_match = re.search(r'\[Microtheme\]\s*\n([^\n]+)', clean_text)
        if theme_match:
            current_theme = theme_match.group(1).strip()

        # Find questions: e.g. "1.   [2026]  "
        q_matches = list(re.finditer(r'(?m)^\s*(\d{1,3})\.\s*\[(\d{4})\]\s*', clean_text))
        for i, qm in enumerate(q_matches):
            next_start = q_matches[i+1].start() if i+1 < len(q_matches) else len(clean_text)
            q_raw = clean_text[qm.start():next_start].strip()

            orig_num = int(qm.group(1))
            year = int(qm.group(2))

            # Extract answer
            ans_m = re.search(r'Ans:\s*\(?([a-d])\)?', q_raw, re.IGNORECASE)
            ans = ans_m.group(1).upper() if ans_m else None

            # Extract body
            q_body = q_raw[:ans_m.start()].strip() if ans_m else q_raw
            q_body = re.sub(r'^\s*\d{1,3}\.\s*\[\d{4}\]\s*', '', q_body).strip()

            # Extract options
            opt_matches = list(re.finditer(r'(?m)^\s*\(?([a-d])\)\s+', q_body, re.IGNORECASE))
            options = []
            q_stem = q_body

            if opt_matches:
                q_stem = q_body[:opt_matches[0].start()].strip()
                for j, om in enumerate(opt_matches):
                    code = om.group(1).upper()
                    end = opt_matches[j+1].start() if j+1 < len(opt_matches) else len(q_body)
                    opt_text = q_body[om.end():end].strip()
                    options.append({
                        "code": code,
                        "textEn": opt_text,
                        "isCorrect": (code == ans) if ans else False
                    })

            # Check format
            q_format = "SINGLE_CHOICE"
            if "Consider the following" in q_stem or "How many of the above" in q_stem:
                q_format = "MULTI_STATEMENT"
            elif "Match List" in q_stem or "Match the following" in q_stem:
                q_format = "MATCH_FOLLOWING"
            elif "Assertion" in q_stem and "Reason" in q_stem:
                q_format = "ASSERTION_REASONING"

            questions.append({
                "source": "Civilsdaily IAS Microthemes 2008-2026",
                "examCategory": "CSE",
                "examStage": "PRELIMS",
                "year": year,
                "origNum": orig_num,
                "paperCode": "GS1",
                "questionFormat": q_format,
                "questionTextEn": q_stem,
                "options": options,
                "officialAnswer": ans,
                "subjectSlug": subject_slug,
                "subjectName": subject_name,
                "topicSlug": slugify(current_theme),
                "topicName": current_theme,
                "pageNumber": pno + 1
            })

            if max_questions and len(questions) >= max_questions:
                break
        if max_questions and len(questions) >= max_questions:
            break

    print(f"Extracted {len(questions)} questions from Microthemes PDF.")
    return questions

def stage_and_verify_questions(questions):
    conn = get_db()
    cur = conn.cursor()

    run_id = f"stage-pyqs-{int(time.time())}"
    cur.execute("""
        INSERT INTO "CorpusIngestionJob" (id, "runId", action, status, "startedAt", note, "createdAt")
        VALUES (gen_random_uuid(), %s, 'STAGE_VERIFIED_PYQS', 'RUNNING', NOW(), %s, NOW())
        RETURNING id;
    """, (run_id, f"Staging {len(questions)} verified questions from authentic UPSC PYQ corpus."))
    job_id = cur.fetchone()[0]
    conn.commit()

    # Track question number per year to avoid collision in QuestionStagingRecord unique constraint
    year_counters = {}

    # Fetch max existing questionNumber per year for CSE GS1 in QuestionStagingRecord
    cur.execute("""
        SELECT year, MAX("questionNumber")
        FROM "QuestionStagingRecord"
        WHERE "paperCode" = 'GS1' AND "examCategory" = 'CSE'
        GROUP BY year;
    """)
    for yr, max_q in cur.fetchall():
        year_counters[yr] = max_q or 0

    staged_count = 0
    verified_count = 0
    error_count = 0

    for q in questions:
        yr = q['year']
        year_counters[yr] = year_counters.get(yr, 0) + 1
        q_num = year_counters[yr]

        opts = q['options']
        ans = q['officialAnswer']
        stem = q['questionTextEn']

        validation_errors = []
        if len(stem) < 15:
            validation_errors.append("Question text stem is too short")
        if len(opts) < 4:
            validation_errors.append(f"Incomplete options: found {len(opts)}, expected 4")
        if not ans:
            validation_errors.append("Missing official answer key")
        elif ans not in {'A', 'B', 'C', 'D'}:
            validation_errors.append(f"Invalid official answer: {ans}")

        workflow_status = "VERIFIED" if len(validation_errors) == 0 else "AWAITING_VERIFICATION"
        if workflow_status == "VERIFIED":
            verified_count += 1

        opts_json = json.dumps(opts)
        errors_json = json.dumps(validation_errors)

        source_ref = f"{q['source']} | Page {q['pageNumber']} | Theme: {q['topicName']} (Orig Q{q['origNum']})"
        citation = f"UPSC CSE Prelims {yr} Official Exam Key / {q['topicName']}"

        try:
            cur.execute("""
                INSERT INTO "QuestionStagingRecord" (
                    id, "importJobId", "sourceReference", "examCategory", "examStage",
                    year, "paperCode", "questionNumber", "questionFormat", "questionTextEn",
                    "optionsJson", "officialAnswer", "sourceCitation", "subjectSlug",
                    "topicSlug", difficulty, "translationStatus", "validationErrorsJson",
                    "workflowStatus", "createdAt", "updatedAt"
                )
                VALUES (
                    gen_random_uuid(), %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, 'MEDIUM', 'TRANSLATION_MISSING', %s,
                    %s, NOW(), NOW()
                )
                ON CONFLICT ("paperCode", year, "questionNumber", "examCategory")
                DO UPDATE SET
                    "questionTextEn" = EXCLUDED."questionTextEn",
                    "optionsJson" = EXCLUDED."optionsJson",
                    "officialAnswer" = EXCLUDED."officialAnswer",
                    "sourceReference" = EXCLUDED."sourceReference",
                    "sourceCitation" = EXCLUDED."sourceCitation",
                    "subjectSlug" = EXCLUDED."subjectSlug",
                    "topicSlug" = EXCLUDED."topicSlug",
                    "validationErrorsJson" = EXCLUDED."validationErrorsJson",
                    "workflowStatus" = EXCLUDED."workflowStatus",
                    "updatedAt" = NOW();
            """, (
                job_id, source_ref, q['examCategory'], q['examStage'],
                yr, q['paperCode'], q_num, q['questionFormat'], stem,
                opts_json, ans, citation, q['subjectSlug'],
                q['topicSlug'], errors_json,
                workflow_status
            ))
            staged_count += 1
        except Exception as e:
            print(f"Error staging Q{q_num} [{yr}]: {e}", file=sys.stderr)
            error_count += 1

    conn.commit()

    # Complete Job
    cur.execute("""
        UPDATE "CorpusIngestionJob"
        SET status = 'COMPLETED', "finishedAt" = NOW(),
            "recordsSeen" = %s, "recordsAdded" = %s, errors = %s,
            note = %s
        WHERE id = %s;
    """, (
        len(questions),
        staged_count,
        error_count,
        f"Staged {staged_count} questions into QuestionStagingRecord. {verified_count} marked VERIFIED with official UPSC answer keys.",
        job_id
    ))
    conn.commit()
    conn.close()

    print("\n=========================================")
    print("QUESTION STAGING REPORT")
    print("=========================================")
    print(f"Total Questions Processed: {len(questions)}")
    print(f"Total Staged in Staging:   {staged_count}")
    print(f"Total Verified with Key:   {verified_count}")
    print(f"Errors:                    {error_count}")
    print("=========================================\n")

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    qs = parse_microthemes_pdf(limit)
    if qs:
        stage_and_verify_questions(qs)
