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

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Applying database migrations..."
pnpm run db:migrate

echo "Applying review governance migration/backfill..."
pnpm run db:migrate:review-governance
pnpm run db:backfill:review-governance

if [ -f "assets/processed/seed.json" ]; then
  echo "Importing MVP dataset..."
  pnpm run content:import:mvp
fi

echo "Starting dev server with hot reload..."
exec pnpm run dev
