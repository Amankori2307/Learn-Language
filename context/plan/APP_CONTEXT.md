# Application Context (Current)

## Purpose

Build a text-first language learning app with high data correctness, strong memory retention loops, and reviewer-governed content quality.

## Product state

- Phase 4 complete.
- Phase 6 core hardening complete (`P6-001` to `P6-011`).
- Active tasks:
  - `P6-012` context hygiene
  - `P6-013` reviewer/admin create-vocabulary flow

## Core capabilities live

- Auth:
  - Google OAuth
  - Local/dev auth fallback
- Learning:
  - Quiz modes: `daily_review`, `new_words`, `cluster`, `weak_words`, `complex_workout`
  - Optional audio mode: `listen_identify` (serves only audio-enabled words)
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
  - complete audit trail in `word_review_events`

## Data/source of truth

- Single seed source: `assets/processed/seed.json`
- Text-first structure:
  - words and example sentences store source script, pronunciation, and meaning directly
  - language is mandatory on content rows

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

1. Execute `P5-003` (image hints for selected vocabulary groups).
2. Continue `P5-004`..`P5-005` in strict order.
