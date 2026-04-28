#!/bin/sh

set -e

alembic upgrade head

DB_USER=${POSTGRES_USER:-user}
DB_NAME=${POSTGRES_DB:-taskdb}
DB_PASS=${POSTGRES_PASSWORD:-password}
DO_SEED=${SEED_DB:-false}

export PGPASSWORD=$DB_PASS
TABLE_EXISTS=$(psql -h db -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.users');" 2>/dev/null)

if [ "$TABLE_EXISTS" = "users" ]; then
    USER_COUNT=$(psql -h db -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM users;" 2>/dev/null)
    if [ "$USER_COUNT" -eq "0" ]; then
        if [ "$DO_SEED" = "true" ] || [ "$DO_SEED" = "1" ]; then
            echo "🌱 Database is empty. Seeding data as requested..."
            python app/scripts/seed_db.py
        else
            echo "⏭️ Database is empty but SEED_DB is not enabled. Skipping seeding."
        fi
    fi
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
