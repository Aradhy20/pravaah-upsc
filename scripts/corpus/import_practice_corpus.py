#!/usr/bin/env python3
"""
Imports generated practice questions into GeneratedPracticeQuestion table.
STRICT DATA SEPARATION:
- Every row is strictly labelled 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'
- Never inserted into Question table
- Never mixed into official PYQ counts
"""
import os
import sys
import time
import json
import hashlib
import psycopg2
from urllib.parse import urlparse

SAMPLE_PRACTICE_QUESTIONS = [
    {
        "practice_id": "PRACTICE-CSE-POL-001",
        "exam_family": "CSE",
        "syllabus_subject": "Polity",
        "syllabus_topic": "Constitutional Framework",
        "difficulty": "MEDIUM",
        "question_text": "With reference to the Constitution of India, consider the following statements regarding the powers of the Governor:\n1. The Governor can promulgate ordinances when either of the two Houses of the state legislature is not in session.\n2. The ordinance-making power of the Governor is discretionary and does not require the advice of the Council of Ministers.\nWhich of the statements given above is/are correct?",
        "option_a": "1 only",
        "option_b": "2 only",
        "option_c": "Both 1 and 2",
        "option_d": "Neither 1 nor 2",
        "answer_letter": "A",
        "explanation": "Statement 1 is correct: Under Article 213, the Governor can promulgate ordinances when the state legislature (or either House in bicameral states) is not in session. Statement 2 is incorrect: The ordinance-making power is not a discretionary power; it is exercised on the aid and advice of the Council of Ministers headed by the Chief Minister.",
        "generation_model": "Gemini-1.5-Pro-Curated",
        "review_status": "REVIEWED_PRACTICE"
    },
    {
        "practice_id": "PRACTICE-CSE-ECO-002",
        "exam_family": "CSE",
        "syllabus_subject": "Economics",
        "syllabus_topic": "Monetary Policy",
        "difficulty": "HARD",
        "question_text": "If the Reserve Bank of India decides to adopt an expansionary monetary policy, which of the following would it NOT do?\n1. Cut and optimize the Statutory Liquidity Ratio (SLR)\n2. Increase the Marginal Standing Facility (MSF) rate\n3. Cut the Bank Rate and Repo Rate\nSelect the correct answer using the code given below:",
        "option_a": "1 and 2 only",
        "option_b": "2 only",
        "option_c": "1 and 3 only",
        "option_d": "1, 2 and 3",
        "answer_letter": "B",
        "explanation": "Increasing the MSF rate tightens liquidity by making borrowing costlier for commercial banks, which is a contractionary measure. Under an expansionary monetary policy, the central bank cuts rates (Bank Rate, Repo Rate, MSF) and eases statutory ratios (SLR, CRR) to infuse liquidity into the economy.",
        "generation_model": "Gemini-1.5-Pro-Curated",
        "review_status": "REVIEWED_PRACTICE"
    },
    {
        "practice_id": "PRACTICE-CSE-ENV-003",
        "exam_family": "CSE",
        "syllabus_subject": "Environment",
        "syllabus_topic": "Biodiversity Conservation",
        "difficulty": "MEDIUM",
        "question_text": "Consider the following statements regarding the Global Biodiversity Framework Fund (GBFF):\n1. It was established under the Global Environment Facility (GEF).\n2. Its primary objective is to support the implementation of the Kunming-Montreal Global Biodiversity Framework.\nWhich of the statements given above is/are correct?",
        "option_a": "1 only",
        "option_b": "2 only",
        "option_c": "Both 1 and 2",
        "option_d": "Neither 1 nor 2",
        "answer_letter": "C",
        "explanation": "Both statements are correct. The GBFF was ratified and launched at the 7th GEF Assembly in Vancouver, Canada, in August 2023. It aims to mobilize and disburse new and additional resources to developing countries to implement the Kunming-Montreal Global Biodiversity Framework.",
        "generation_model": "Gemini-1.5-Pro-Curated",
        "review_status": "REVIEWED_PRACTICE"
    },
    {
        "practice_id": "PRACTICE-CSE-GEO-004",
        "exam_family": "CSE",
        "syllabus_subject": "Geography",
        "syllabus_topic": "Climatology",
        "difficulty": "MEDIUM",
        "question_text": "Which of the following factors contribute to the formation of temperature inversion in the troposphere?\n1. Long winter nights\n2. Clear, cloudless skies\n3. Still or calm air\n4. Fast moving surface winds\nSelect the correct answer using the code given below:",
        "option_a": "1, 2 and 3 only",
        "option_b": "2 and 4 only",
        "option_c": "1, 3 and 4 only",
        "option_d": "1, 2, 3 and 4",
        "answer_letter": "A",
        "explanation": "Conditions favorable for radiation inversion are: long winter nights (so cooling period exceeds heating period), clear skies (facilitating unhindered terrestrial radiation escape), calm air (preventing vertical mixing of heat), and cold dry air near the ground. Fast moving surface winds prevent inversion by mixing warm and cold layers.",
        "generation_model": "Gemini-1.5-Pro-Curated",
        "review_status": "REVIEWED_PRACTICE"
    },
    {
        "practice_id": "PRACTICE-CSE-SCI-005",
        "exam_family": "CSE",
        "syllabus_subject": "Science & Technology",
        "syllabus_topic": "Space & Frontier Technology",
        "difficulty": "HARD",
        "question_text": "With reference to Quantum Key Distribution (QKD), consider the following statements:\n1. It uses principles of quantum mechanics to encrypt and transmit confidential communication keys.\n2. Any attempt by an eavesdropper to measure the transmission disrupts the quantum state, alerting the legitimate communicating parties.\nWhich of the statements given above is/are correct?",
        "option_a": "1 only",
        "option_b": "2 only",
        "option_c": "Both 1 and 2",
        "option_d": "Neither 1 nor 2",
        "answer_letter": "C",
        "explanation": "Both statements are correct. QKD relies on quantum physics (such as the Heisenberg Uncertainty Principle and No-Cloning Theorem). The measurement of an entangled photon or quantum state irreversibly alters it, ensuring detection of any eavesdropping attempt.",
        "generation_model": "Gemini-1.5-Pro-Curated",
        "review_status": "REVIEWED_PRACTICE"
    }
]

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

def import_practice_questions():
    conn = get_db()
    cur = conn.cursor()

    run_id = f"import-practice-{int(time.time())}"
    cur.execute("""
        INSERT INTO "CorpusIngestionJob" (id, "runId", action, status, "startedAt", note, "createdAt")
        VALUES (gen_random_uuid(), %s, 'IMPORT_PRACTICE_QUESTIONS', 'RUNNING', NOW(), %s, NOW())
        RETURNING id;
    """, (run_id, f"Importing {len(SAMPLE_PRACTICE_QUESTIONS)} generated practice questions with strict label separation."))
    job_id = cur.fetchone()[0]
    conn.commit()

    imported = 0
    errors = 0

    for item in SAMPLE_PRACTICE_QUESTIONS:
        label = "GENERATED_PRACTICE_NOT_OFFICIAL_PYQ"
        try:
            cur.execute("""
                INSERT INTO "GeneratedPracticeQuestion" (
                    id, "practiceId", "examFamily", "syllabusSubject", "syllabusTopic",
                    difficulty, "questionText", "optionA", "optionB", "optionC", "optionD",
                    "answerLetter", explanation, "generationModel", "generatedAt",
                    "reviewStatus", "contentLabel", "createdAt", "updatedAt"
                )
                VALUES (
                    gen_random_uuid(), %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, NOW()::text,
                    %s, %s, NOW(), NOW()
                )
                ON CONFLICT ("practiceId")
                DO UPDATE SET
                    "questionText" = EXCLUDED."questionText",
                    "optionA" = EXCLUDED."optionA",
                    "optionB" = EXCLUDED."optionB",
                    "optionC" = EXCLUDED."optionC",
                    "optionD" = EXCLUDED."optionD",
                    "answerLetter" = EXCLUDED."answerLetter",
                    "explanation" = EXCLUDED."explanation",
                    "reviewStatus" = EXCLUDED."reviewStatus",
                    "contentLabel" = EXCLUDED."contentLabel",
                    "updatedAt" = NOW();
            """, (
                item['practice_id'], item['exam_family'], item['syllabus_subject'], item['syllabus_topic'],
                item['difficulty'], item['question_text'], item['option_a'], item['option_b'], item['option_c'], item['option_d'],
                item['answer_letter'], item['explanation'], item['generation_model'],
                item['review_status'], label
            ))
            imported += 1
        except Exception as e:
            print(f"Error importing practice question {item['practice_id']}: {e}", file=sys.stderr)
            errors += 1

    conn.commit()

    # Finish job
    cur.execute("""
        UPDATE "CorpusIngestionJob"
        SET status = 'COMPLETED', "finishedAt" = NOW(),
            "recordsSeen" = %s, "recordsAdded" = %s, errors = %s,
            note = %s
        WHERE id = %s;
    """, (
        len(SAMPLE_PRACTICE_QUESTIONS),
        imported,
        errors,
        f"Imported {imported} generated practice questions with contentLabel = 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'.",
        job_id
    ))
    conn.commit()
    conn.close()

    print("\n=========================================")
    print("PRACTICE QUESTION INGESTION FINISHED")
    print("=========================================")
    print(f"Total Imported:     {imported}")
    print(f"Content Label:      GENERATED_PRACTICE_NOT_OFFICIAL_PYQ (ENFORCED)")
    print(f"Target Table:       GeneratedPracticeQuestion (ISOLATED)")
    print(f"Official PYQ Mix:   0 (Guaranteed)")
    print("=========================================\n")

if __name__ == '__main__':
    import_practice_questions()
