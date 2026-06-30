"""Run supabase_schema.sql against the live Supabase database.

Requires the SUPABASE_DB_URL environment variable to be set, e.g.:
  export SUPABASE_DB_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"
"""
import os
import psycopg2
import sys

DB_URL = os.environ.get("SUPABASE_DB_URL")
if not DB_URL:
    print("Error: SUPABASE_DB_URL environment variable is not set.", file=sys.stderr)
    sys.exit(1)

with open("supabase_schema.sql", "r", encoding="utf-8") as f:
    sql = f.read()

print("Connecting to Supabase PostgreSQL...")
try:
    conn = psycopg2.connect(DB_URL, connect_timeout=15, sslmode="require")
    conn.autocommit = True
    cur = conn.cursor()
    print("Connected. Running schema...")
    cur.execute(sql)
    print("Schema applied successfully.")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
