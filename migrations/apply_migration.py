"""Apply a single migration SQL file to the live Supabase database.

Usage:
  python migrations/apply_migration.py migrations/0001_external_roles.sql

Requires the SUPABASE_DB_URL environment variable to be set, e.g.:
  export SUPABASE_DB_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"
  (PowerShell: $env:SUPABASE_DB_URL="postgresql://...")

This intentionally takes the password only via environment variable —
never pass it on the command line or hardcode it in this file.
"""
import os
import sys
import psycopg2

if len(sys.argv) != 2:
    print("Usage: python migrations/apply_migration.py <path-to-migration.sql>", file=sys.stderr)
    sys.exit(1)

migration_path = sys.argv[1]

DB_URL = os.environ.get("SUPABASE_DB_URL")
if not DB_URL:
    print("Error: SUPABASE_DB_URL environment variable is not set.", file=sys.stderr)
    sys.exit(1)

if not os.path.exists(migration_path):
    print(f"Error: migration file not found: {migration_path}", file=sys.stderr)
    sys.exit(1)

with open(migration_path, "r", encoding="utf-8") as f:
    sql = f.read()

print(f"Connecting to Supabase PostgreSQL...")
try:
    conn = psycopg2.connect(DB_URL, connect_timeout=15, sslmode="require")
    conn.autocommit = True
    cur = conn.cursor()
    print(f"Connected. Applying {migration_path} ...")
    cur.execute(sql)
    print("Migration applied successfully.")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
