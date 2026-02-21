# Application Context (Current)

## Purpose

Build a text-first language learning app with high data correctness, strong memory retention loops, and reviewer-governed content quality.

## Product state

- Phase 4 complete.
- Phase 6 core hardening complete (`P6-001` to `P6-011`).
- Active tasks: none.

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
  - Cluster UX/data improvements:
    - cluster list API returns language-scoped `wordCount`
    - cluster UI shows cluster size and richer cluster catalog via POS-derived clusters
    - generic imported descriptions are normalized to meaningful learner-facing copy
  - Quiz feedback now returns and renders up to 3 example sentences per answer (sentence + pronunciation + meaning)
  - Quiz completion CTA flow now resets session state on mode switches and routes to working next-session CTAs (including reinforcement loop)
- Stats/analytics:
  - recall vs recognition accuracy
  - direction strength averages
  - language-window leaderboard correctness (`daily`, `weekly`, `all_time`)
  - language-scoped learning insights module:
    - weakest clusters by accuracy/attempts
    - strongest categories by part of speech
    - weak words and strong words focus lists
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

- Split seed source:
  - `assets/processed/words.json`
  - `assets/processed/sentences.json`
- Text-first structure:
  - words and sentences store source script, pronunciation, and meaning directly
  - sentence records include `wordRefs` links so examples are deterministic and reusable
  - language is mandatory on all content rows
  - part-of-speech and tags are enum-backed across contracts, import, validation, and vocab forms

## Runtime and quality gates

- Package manager: `pnpm`
- App port: `3000`
- Primary quality gate command: `pnpm run lint`
  - eslint (`--max-warnings=0`) + typecheck + content validation + single-source seed verification + backend tests + UI tests
- Docker compose:
  - hot reload enabled
  - app uses in-network DB connection: `postgresql://postgres:postgres@db:5432/mydb`
- CI:
  - pnpm-based workflow parity with local/docker checks

## Immediate next implementation

- Execute in order: select next tasks from `context/plan/61-pronunciation-strategy.md` backlog.
- Latest planning artifact: `context/plan/61-pronunciation-strategy.md`.
