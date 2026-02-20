# Application Context (Current)

## Purpose

Build a Telugu learning app focused on text-first retention and beginner-friendly learning.

## Current supported features

- Auth:
  - Google OAuth (primary)
  - Dev auth mode (local development)
- Learning engine:
  - Quiz generation (`daily_review`, `new_words`, `cluster`, `weak_words`, `complex_workout`)
  - Adaptive candidate scoring
  - SM-2 style review updates
  - Weak-word reinforcement loop
  - Text-first contextual mode and optional text tutor mode (feature flag)
- UX:
  - Dashboard with stats and launch actions
  - Clusters page
  - Quiz flow with confidence capture
  - Leaderboard page (daily/weekly/all-time windows)
  - Profile page (name + avatar URL updates)
  - Pronunciation-first display style for Telugu prompts (transliteration first, Telugu in brackets)
  - Words-first quiz prompts (word/phrase only in current phase)
  - Post-answer sentence example triplet in feedback (sentence + pronunciation + meaning)
- Content/data:
  - Seed files now sourced from `assets/processed/`
  - Beginner model seed: `assets/processed/telugu_basic_seed_model_draft.json`
  - MVP seed: `assets/processed/words.mvp.json` (realistic Telugu beginner set, 91 rows)
- Review governance:
  - Word review lifecycle fields (`draft`, `pending_review`, `approved`, `rejected`)
  - Review queue, transition, bulk transition, history, and draft submission APIs
  - Review audit events table with source metadata
  - Reviewer/admin permission middleware + role bootstrap script (`pnpm run user:set-role`)
  - Migration/backfill scripts for governance schema (`pnpm run db:migrate:review-governance`, `pnpm run db:backfill:review-governance`)

## Stack

- Frontend: React + Vite + TanStack Query + Tailwind
- Backend: Express + TypeScript
- DB: PostgreSQL + Drizzle ORM
- Package manager: pnpm
- Container: Docker Compose
- UI test runtime: Vitest + Testing Library

## Important runtime notes

- App default port: `3000`
- Compose is configured for dev hot reload (bind mount + `pnpm run dev` watch mode).
- Database connection in compose: `postgresql://postgres:postgres@db:5432/mydb`.
- Production-like startup still available via existing production entrypoint if needed.
