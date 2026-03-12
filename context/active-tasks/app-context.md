# Application Context (Current)

## Purpose

Build a text-first language learning app with high data correctness, strong memory retention loops, and reviewer-governed content quality.

Keep this file compact. It should capture the durable gist of the current app and execution state, not become a running log.

## Product state

- Core platform work through Phases 4, 6, 7, 8, 9, 10, and 12 is complete.
- Recent follow-up work is complete for:
  - quiz confidence preference restoration
  - learner/reviewer route coverage expansion
  - quiz/auth/add-vocabulary/tutor route-state hardening
  - React Query ownership/query-key/invalidation cleanup
  - documentation and planning-context reconciliation

## Core capabilities live

- Auth:
  - Google OAuth
- Learning:
  - quiz modes: `daily_review`, `new_words`, `cluster`, `weak_words`, `complex_workout`
  - optional `listen_identify` audio mode
  - optional image hints in quiz payload/UI
  - language-scoped learner isolation across quiz, analytics, clusters, leaderboard, and vocabulary
  - versioned, direction-aware SRS with config stamping and weaker-direction prioritization
  - quiz feedback with example sentences and working completion/next-session CTA flow
  - quiz confidence input restored behind a learner preference
- Analytics:
  - stats, attempt history, word buckets, leaderboard, learning insights, and SRS drift monitoring
- Review:
  - draft/pending/approved/rejected lifecycle
  - reviewer conflict queue and conflict resolution flow
  - reviewer/admin draft creation with optional `audioUrl` and `imageUrl`
- Theming:
  - named theme ownership is in place
  - implemented themes: `Current`, `Minimal`
  - planned themes exist in the enum/registry for later rollout

## Data/source of truth

- Split seed source:
  - `assets/processed/words.json`
  - `assets/processed/sentences.json`
- Text-first structure:
  - words and sentences store source script, pronunciation, and meaning directly
  - sentence records include `wordRefs` links so examples are deterministic and reusable
  - language is mandatory on all content rows
  - part-of-speech and tags are enum-backed across contracts, import, validation, and vocab forms
- Seed expansion policy (persistent):
  - when adding seed content, always add both:
    - new words in `words.json`
    - linked example sentences in `sentences.json`
  - each new word should get at least 2 linked sentences via `wordRefs`
  - sentence pronunciation must be complete sentence-level romanization (not word-level fragments)
  - pronunciation/transliteration must be normalized for browser `speechSynthesis` (ASCII-friendly, no hidden unicode artifacts)
  - keep validator rules green:
    - no placeholders/dummy values
    - lowercase kebab-case for clusters/context tags
    - valid enum-backed `language`, `partOfSpeech`, and tags

## Runtime and quality gates

- Package manager: `pnpm`
- App port: `3000`
- Primary quality gate command: `pnpm run lint`
  - eslint (`--max-warnings=0`) + typecheck + content validation + single-source seed verification + backend tests + UI tests
- Docker compose:
  - hot reload enabled
  - app uses in-network DB connection: `postgresql://postgres:postgres@db:5432/mydb`
- Optional TTS env knobs:
  - `ENABLE_GCP_TTS=true`
  - `GOOGLE_TTS_API_KEY=<your_google_cloud_api_key>`
- CI:
  - pnpm-based workflow parity with local/docker checks
  - GitHub Actions quality gate now provisions Postgres, runs migrations/content import, runs `pnpm run ci`, runs production-like smoke, and then builds
  - lint now also enforces symbol ownership through `script/check-symbol-governance.ts`
- Governance/documentation:
  - code governance contract in [documentation/code-governance-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/code-governance-contract.md)
  - DI policy in [documentation/dependency-injection-policy.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/dependency-injection-policy.md)
  - AI roadmap in [documentation/ai-product-roadmap.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/ai-product-roadmap.md)

## Current execution state

- Active backlog: none in [backlog.md](/Users/aman/Projects/personal-projects/Learn-Language/context/active-tasks/backlog.md)
- Future candidate work belongs in [future-tasks/backlog.md](/Users/aman/Projects/personal-projects/Learn-Language/context/future-tasks/backlog.md)
- Recent completed work:
  - planning/context system cleanup and rename pass
  - repo-level `AGENTS.md` creation
  - dedicated planning guidelines creation
- Detailed completed phase history lives in `context/archive/`.
- Theme-system outcome:
  - named theme ownership, semantic tokenized primitives, and chart theme support are in place
