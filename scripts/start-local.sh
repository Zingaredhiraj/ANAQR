#!/usr/bin/env bash
set -e

# Export PostgreSQL shared libraries
export LD_LIBRARY_PATH="/home/dhiraj/.local/postgres18/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"

cd "$(dirname "$0")/.."

# Check PostgreSQL
if ! /home/dhiraj/.local/postgres18/usr/lib/postgresql/18/bin/pg_isready -h 127.0.0.1 -p 5433 > /dev/null 2>&1; then
  echo "Starting PostgreSQL 18 on port 5433..."
  /home/dhiraj/.local/postgres18/usr/lib/postgresql/18/bin/pg_ctl \
    -D /home/dhiraj/.local/postgres18/data -l /tmp/postgres.log start
  sleep 2
fi

echo "Starting AnaQR monorepo services..."
exec pnpm dev
