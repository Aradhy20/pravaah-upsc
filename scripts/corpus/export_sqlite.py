#!/usr/bin/env python3
"""
Exports SQLite corpus tables (sources, exams, documents) to JSON for Prisma ingestion.
"""
import sqlite3
import json
import os
import sys

SQLITE_PATH = os.path.join(
    os.path.dirname(__file__),
    '../../data/corpus_starter_kit/UPSC_All_Exams_Corpus_Starter_Kit/upsc_pyq_searchable.sqlite'
)
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__),
    '../../data/corpus_starter_kit/corpus_dump.json'
)

def export_sqlite():
    if not os.path.exists(SQLITE_PATH):
        print(f"Error: SQLite database not found at {SQLITE_PATH}", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Sources
    cursor.execute("SELECT * FROM sources")
    sources = [dict(row) for row in cursor.fetchall()]

    # 2. Exams
    cursor.execute("SELECT * FROM exams")
    exams = [dict(row) for row in cursor.fetchall()]

    # 3. Documents
    cursor.execute("SELECT * FROM documents")
    documents = [dict(row) for row in cursor.fetchall()]

    data = {
        "sources": sources,
        "exams": exams,
        "documents": documents
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Exported successfully:")
    print(f"  Sources: {len(sources)}")
    print(f"  Exams: {len(exams)}")
    print(f"  Documents: {len(documents)}")
    print(f"  Saved to: {OUTPUT_PATH}")

if __name__ == '__main__':
    export_sqlite()
