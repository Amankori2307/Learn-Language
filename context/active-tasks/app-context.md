# Application Context (Current)

## Purpose

Build a text-first language learning app with high data correctness, strong memory retention loops, and reviewer-governed content quality.

Keep this file compact. It should capture the durable gist of the current app and execution state, not become a running log.

## Product state

- Core platform work through Phases 4, 6, 7, 8, 9, 10, and 12 is complete.
- Recent follow-up work is complete for:
  - server-inferred quiz confidence rollout
  - learner/reviewer route coverage expansion
  - quiz/auth/add-vocabulary/tutor route-state hardening
  - React Query ownership/query-key/invalidation cleanup
  - documentation and planning-context reconciliation
  - single-source-of-truth ownership and documentation/context boundary enforcement

Current canonical app truth lives in:

- [core-features.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/product/core-features.md)
- [frontend-architecture.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/frontend-architecture.md)
- [frontend-ui-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/frontend-ui-contract.md)
- [continuum-design-system.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/continuum-design-system.md)
- [theme-system.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/theme-system.md)
- [planning-guidelines.md](/Users/aman/Projects/personal-projects/Learn-Language/context/guidelines/planning-guidelines.md)

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
  - the CI workflow now forces JavaScript actions onto the Node.js 24 runner runtime and installs `pnpm` with `corepack` instead of `pnpm/action-setup`
  - lint now also enforces symbol ownership through `script/check-symbol-governance.ts`
  - lint now also enforces design-system governance through `script/check-design-system-governance.ts`
- Governance/documentation:
  - code and DI rules in [code-guidelines.md](/Users/aman/Projects/personal-projects/Learn-Language/context/guidelines/code-guidelines.md)
  - planning and source-of-truth rules in [planning-guidelines.md](/Users/aman/Projects/personal-projects/Learn-Language/context/guidelines/planning-guidelines.md)

## Current execution state

- Active backlog: [backlog.md](/Users/aman/Projects/personal-projects/Learn-Language/context/active-tasks/backlog.md)
- Future candidate work belongs in [future-tasks/backlog.md](/Users/aman/Projects/personal-projects/Learn-Language/context/future-tasks/backlog.md)
- Recent completed work:
  - admins can now download repo-style vocabulary exports from the review surface, with the backend emitting `words.json` and `sentences.json` payloads from the live database
  - quiz answers no longer ask learners for manual confidence; the server now infers a recall-confidence signal for SRS and history while preserving backward-compatible attempt fields
  - review queue actions are now status-aware: approved items show un-approve, rejected items show revised-draft recovery plus move-for-approval, and the queue header explains what `draft` means in the lifecycle
  - browser speech synthesis now ranks higher-quality English and Telugu-family voices instead of taking the first acceptable system voice, improving macOS fallback quality when better local voices exist
  - browser speech fallback now warms the voice list, prefers better Indian-language voice matches for Telugu-family playback, and avoids generic English fallback that caused distorted macOS pronunciation
  - public app-router pages and the authenticated SPA now share one root runtime theme provider instead of drifting between public fallback styling and app-selected themes
  - Telugu vocabulary coverage now includes an additional transport/transit slice with linked example sentences for train, station, bus-stop, platform, luggage, seat, reach, and depart usage
  - hybrid quiz audio playback now reuses a hardened HTML audio path and avoids unsupported speech-synthesis fallback on macOS/Apple browsers when no compatible voice exists
  - public methodology page now explains active recall versus recognition and spaced repetition as an indexable discovery route
  - quiz session mobile viewport sizing now follows the feedback-screen fixed-shell pattern using shared viewport-safe sizing tokens
  - repo-wide Continuum enforcement hardening across shared UI primitives with no remaining checker folder escape hatch
  - shared primitive width/height/radius/hairline values migrated onto named Continuum size tokens
  - public Next.js marketing-route adoption onto shared Continuum primitives
  - design-system governance extension from `client/src` into `app/`
  - Continuum design-system publication and cross-doc adoption
  - design-system governance enforcement in the lint gate
  - shell, dashboard, review, tutor, and quiz state migration onto shared sizing tokens
  - responsive regression coverage for shell and migrated high-risk surfaces
  - planning/context system cleanup and rename pass
  - repo-level `AGENTS.md` creation
  - dedicated planning guidelines creation
  - documentation boundary enforcement and canonical doc restructuring
  - source-of-truth policy publication and `app-context.md` handoff reduction
- Detailed completed phase history lives in `context/archive/`.
