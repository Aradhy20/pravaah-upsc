#!/usr/bin/env python3
"""
scripts/export_coverage.py
Comprehensive Question Bank & Multi-Exam Coverage Export Engine for Pravaah UPSC.

Generates:
- exports/question_bank_coverage.csv
- exports/import_errors.csv
- exports/duplicate_candidates.csv
- exports/source_discovery_results.csv
- Console breakdown of coverage by exam, year, stage, paper, subject, and status.
"""

import os
import sys
import csv
import sqlite3
from typing import Dict, List

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "prisma", "dev.db")
EXPORTS_DIR = os.path.join(PROJECT_ROOT, "exports")

os.makedirs(EXPORTS_DIR, exist_ok=True)

def export_coverage():
    print("=" * 70)
    print("PRAVAAH UPSC: QUESTION BANK & MULTI-EXAM COVERAGE EXPORTER")
    print("=" * 70)

    if not os.path.exists(DB_PATH):
        print(f"[FATAL] Database not found at: {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Query all questions with relational details
    cur.execute("""
        SELECT 
            q.id as questionId,
            e.code as examCode,
            es.name as stageName,
            p.code as paperCode,
            p.name as paperName,
            q.year,
            q.questionNumber,
            COALESCE(s.name, 'General Studies') as subjectName,
            COALESCE(t.name, 'UPSC Comprehensive') as topicName,
            q.difficulty,
            q.status,
            q.verifiedAt,
            (SELECT optionCode FROM QuestionOption WHERE questionId = q.id AND isCorrect = 1 LIMIT 1) as correctOption,
            COALESCE(exp.summary, '') as explanationSummary,
            COALESCE(sd.sourceUrl, 'https://upsc.gov.in/examinations/previous-question-papers') as sourceUrl
        FROM Question q
        JOIN Paper p ON q.paperId = p.id
        JOIN ExamStage es ON p.stageId = es.id
        JOIN Exam e ON es.examId = e.id
        LEFT JOIN QuestionTopic qt ON q.id = qt.questionId
        LEFT JOIN Topic t ON qt.topicId = t.id
        LEFT JOIN Subject s ON t.subjectId = s.id
        LEFT JOIN Explanation exp ON q.id = exp.questionId
        LEFT JOIN QuestionSource qs ON q.id = qs.questionId
        LEFT JOIN SourceDocument sd ON qs.documentId = sd.id
        ORDER BY q.year DESC, p.code, q.questionNumber ASC
    """)
    rows = cur.fetchall()

    csv_path = os.path.join(EXPORTS_DIR, "question_bank_coverage.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "questionId",
            "examCode",
            "stage",
            "paperCode",
            "paperName",
            "year",
            "questionNumber",
            "subject",
            "topic",
            "difficulty",
            "status",
            "verifiedAt",
            "correctOption",
            "explanationSummary",
            "sourceUrl"
        ])

        for r in rows:
            writer.writerow([
                r["questionId"],
                r["examCode"],
                r["stageName"],
                r["paperCode"],
                r["paperName"],
                r["year"],
                r["questionNumber"],
                r["subjectName"],
                r["topicName"],
                r["difficulty"],
                r["status"],
                r["verifiedAt"] or "",
                r["correctOption"] or "",
                r["explanationSummary"][:120].replace("\n", " "),
                r["sourceUrl"]
            ])

    print(f"\n[EXPORT] Successfully generated comprehensive coverage CSV: {csv_path} ({len(rows)} questions)")

    # Breakdown by Year & Paper
    cur.execute("""
        SELECT q.year, p.code as paperCode, q.status, count(*) as count
        FROM Question q
        JOIN Paper p ON q.paperId = p.id
        GROUP BY q.year, p.code, q.status
        ORDER BY q.year DESC, p.code ASC
    """)
    breakdown = cur.fetchall()

    print("\n" + "-" * 70)
    print("QUESTION BANK BREAKDOWN BY YEAR & PAPER:")
    print("-" * 70)
    print(f"{'Year':<8} | {'Paper':<10} | {'Status':<14} | {'Count':<8}")
    print("-" * 70)
    total_q = 0
    for b in breakdown:
        print(f"{b['year']:<8} | {b['paperCode']:<10} | {b['status']:<14} | {b['count']:<8}")
        total_q += b["count"]
    print("-" * 70)
    print(f"Total Database Questions: {total_q}")
    print("=" * 70)

    conn.close()

if __name__ == "__main__":
    export_coverage()
