# Application Context (Current)

## Purpose

Build a text-first language learning app with high data correctness, strong memory retention loops, and reviewer-governed content quality.

## Product state

- Phase 4 complete.
- Phase 6 core hardening complete (`P6-001` to `P6-011`).
- Active tasks:
  - `P6-021` fix quiz option highlight/selection reset between questions
  - `P6-020` split "Add Vocabulary" and "Review Vocabulary" into separate pages
  - `P6-014` completion/revision UX when new queue is empty
  - `P6-015` split seed source into `words.json` + `sentences.json` with linkage
  - `P6-016` cluster UX upgrade with per-cluster counts
  - `P6-017` quiz feedback with multiple example sentences
  - `P6-018` learner analytics for strengths/gaps
  - `P6-019` pronunciation strategy note (non-implementation)

## Core capabilities live

- Auth:
  - Google OAuth
  - Local/dev auth fallback
- Learning:
  - Quiz modes: `daily_review`, `new_words`, `cluster`, `weak_words`, `complex_workout`
  - Optional audio mode: `listen_identify` (serves only audio-enabled words)
  - Optional image hints via `imageUrl` in quiz payload/UI (rendered only when present)
  - Language-scoped learner data isolation for quiz/stats/attempts/clusters/leaderboard/words
  - SRS scheduling with:
    - versioned config (`srs_configs`)
    - per-update config version stamp (`user_word_progress.srs_config_version`)
    - per-direction strengths:
      - `source_to_target_strength`
      - `target_to_source_strength`
  - Direction-aware candidate prioritization (weaker direction gets higher practice priority)
- Stats/analytics:
  - recall vs recognition accuracy
  - direction strength averages
  - language-window leaderboard correctness (`daily`, `weekly`, `all_time`)
  - SRS drift monitoring endpoint:
    - `GET /api/admin/srs/drift`
    - alerts for overdue growth, interval spikes, and empty-review-day anomalies
- Review governance:
  - review lifecycle: `draft`, `pending_review`, `approved`, `rejected`
  - reviewer metadata:
    - `reviewer_confidence_score`
    - `requires_secondary_review`
    - `disagreement_status` (`none`, `flagged`, `resolved`)
  - conflict workflow:
    - queue endpoint: `GET /api/review/conflicts`
    - resolution endpoint: `PATCH /api/review/words/:id/resolve-conflict`
  - reviewer/admin draft creation now supports optional `audioUrl` for future media-enabled modes
  - reviewer/admin draft creation now supports optional `imageUrl`
  - complete audit trail in `word_review_events`

## Data/source of truth

- Single seed source: `assets/processed/seed.json`
- Text-first structure:
  - words and example sentences store source script, pronunciation, and meaning directly
  - language is mandatory on content rows

Planned migration (active):
- move from single file to split source:
  - `assets/processed/words.json`
  - `assets/processed/sentences.json`
- sentence records will explicitly link to words so example selection is deterministic and multi-example capable.

## Runtime and quality gates

- Package manager: `pnpm`
- App port: `3000`
- Primary quality gate command: `pnpm run lint`
  - eslint + typecheck + content validation + single-source seed verification + backend tests + UI tests
- Docker compose:
  - hot reload enabled
  - app uses in-network DB connection: `postgresql://postgres:postgres@db:5432/mydb`
- CI:
  - pnpm-based workflow parity with local/docker checks

## Immediate next implementation

- Execute in order: `P6-021` -> `P6-020` -> `P6-014` -> `P6-015` -> `P6-016` -> `P6-017` -> `P6-018` -> `P6-019`.
