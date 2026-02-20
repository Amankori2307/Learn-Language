#!/usr/bin/env sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

echo "Waiting for Postgres..."
until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
  sleep 1
done

echo "Applying schema..."
pnpm run db:push

echo "Applying review governance migration/backfill..."
pnpm run db:migrate:review-governance
pnpm run db:backfill:review-governance

echo "Importing MVP dataset..."
pnpm run content:import:mvp

echo "Building app..."
pnpm run build

echo "Starting app..."
exec pnpm run start
