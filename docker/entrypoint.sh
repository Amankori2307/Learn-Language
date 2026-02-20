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
npm run db:push

echo "Importing MVP dataset..."
npm run content:import:mvp

echo "Building app..."
npm run build

echo "Starting app..."
exec npm run start
