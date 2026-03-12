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
