import os
import sqlite3
import psycopg2
from psycopg2 import extras
from datetime import datetime

def parse_val(val, pg_type):
    if val is None:
        return None
    if pg_type == 'boolean':
        if isinstance(val, bool):
            return val
        if isinstance(val, (int, float)):
            return bool(val)
        if isinstance(val, str):
            return val.lower() in ('1', 'true', 't', 'yes')
        return bool(val)
    if pg_type in ('timestamp with time zone', 'timestamp without time zone'):
        if isinstance(val, str):
            # parse ISO formats
            try:
                # Handle possible 'Z' or trailing offsets
                clean_str = val.replace('Z', '+00:00')
                return datetime.fromisoformat(clean_str)
            except Exception:
                try:
                    # fallback to epoch if numeric
                    num = float(val)
                    if num > 1e11: # milliseconds
                        return datetime.fromtimestamp(num / 1000.0)
                    return datetime.fromtimestamp(num)
                except Exception:
                    return val
        elif isinstance(val, (int, float)):
            if val > 1e11:
                return datetime.fromtimestamp(val / 1000.0)
            return datetime.fromtimestamp(val)
    return val

def main():
    sqlite_path = 'prisma/dev.db'
    if not os.path.exists(sqlite_path):
        print(f"Error: {sqlite_path} does not exist")
        return

    # Load PostgreSQL connection string from .env
    pg_url = os.environ.get('DATABASE_URL_UNPOOLED') or os.environ.get('DATABASE_URL')
    if not pg_url or 'file:' in pg_url:
        with open('.env') as f:
            for line in f:
                if line.startswith('DATABASE_URL_UNPOOLED='):
                    pg_url = line.split('=', 1)[1].strip().strip('\"')
                    break
                elif line.startswith('DATABASE_URL=') and not pg_url:
                    pg_url = line.split('=', 1)[1].strip().strip('\"')

    print("Connecting to SQLite and Neon PostgreSQL...")
    s_conn = sqlite3.connect(sqlite_path)
    s_cur = s_conn.cursor()

    p_conn = psycopg2.connect(pg_url)
    p_cur = p_conn.cursor()

    # Tables in strict dependency order
    tables = [
        "Role",
        "User",
        "UserProfile",
        "Exam",
        "ExamStage",
        "Paper",
        "Subject",
        "Topic",
        "SourceDocument",
        "Question",
        "QuestionOption",
        "Explanation",
        "AnswerKeyVersion",
        "QuestionTopic",
        "QuestionSource",
        "Test",
        "TestQuestion",
        "TestSession",
        "UserResponse",
        "UserAttempt",
        "Bookmark",
        "UserNote",
        "ReviewSchedule",
        "StudyGoal",
        "StudyActivity",
        "Plan",
        "PlanPrice",
        "PlanFeature",
        "FeatureEntitlement",
        "Subscription",
        "SubscriptionEvent",
        "PaymentRecord",
        "RefundRecord",
        "CurrentAffairsStory",
        "StoryTopic",
        "StoryQuestionLink",
        "DailyQuiz",
        "DailyQuizQuestion",
        "DailyQuizAttempt",
        "MainsQuestion",
        "MainsDraft",
        "ExamDirectory",
        "BackgroundJob",
        "SourceRegistryRecord",
        "ContentImportJob",
        "ContentReview",
        "AuditLog",
    ]

    for table in tables:
        # Check if table exists in SQLite
        s_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
        if not s_cur.fetchone():
            continue

        # Get column details from Postgres
        p_cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = %s
        """, (table,))
        pg_cols = {r[0]: r[1] for r in p_cur.fetchall()}
        if not pg_cols:
            continue

        # Get columns from SQLite
        s_cur.execute(f"PRAGMA table_info(\"{table}\")")
        s_cols = [r[1] for r in s_cur.fetchall()]

        # Common columns
        common_cols = [c for c in s_cols if c in pg_cols]
        if not common_cols:
            continue

        # Fetch all rows from SQLite
        cols_query = ", ".join([f'"{c}"' for c in common_cols])
        s_cur.execute(f"SELECT {cols_query} FROM \"{table}\"")
        rows = s_cur.fetchall()
        if not rows:
            print(f"  [SKIP] {table:28}: 0 rows in SQLite")
            continue

        # Format rows for Postgres
        converted_rows = []
        for row in rows:
            converted_row = []
            for col_name, val in zip(common_cols, row):
                pg_type = pg_cols[col_name]
                converted_row.append(parse_val(val, pg_type))
            converted_rows.append(tuple(converted_row))

        # Insert into Postgres with ON CONFLICT DO NOTHING
        quoted_cols = ", ".join([f'"{c}"' for c in common_cols])
        insert_query = f"INSERT INTO \"{table}\" ({quoted_cols}) VALUES %s ON CONFLICT DO NOTHING"
        
        try:
            extras.execute_values(p_cur, insert_query, converted_rows, page_size=500)
            p_conn.commit()
            print(f"  [MIGRATED] {table:24}: {len(converted_rows)} rows migrated to Neon")
        except Exception as e:
            p_conn.rollback()
            print(f"  [ERROR] {table:27}: {e}")

    # Verify counts in Postgres
    print("\n--- Verifying Neon Postgres Counts ---")
    for table in tables:
        try:
            p_cur.execute(f'SELECT count(*) FROM "{table}"')
            count = p_cur.fetchone()[0]
            if count > 0:
                print(f"  {table:28}: {count} rows")
        except Exception:
            p_conn.rollback()

    s_conn.close()
    p_conn.close()
    print("\nMigration completed successfully!")

if __name__ == '__main__':
    main()
