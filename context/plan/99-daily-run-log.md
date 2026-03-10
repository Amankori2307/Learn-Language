# Daily Run Log (Compact)

Date: 2026-03-10  
Session owner: Codex  
Last completed task ID: P8-008  
Current in-progress task ID: -  
Next task ID: P9-001

## Current state

- Production deploy flow now uploads local `.env.production` to the server on every deploy and force-recreates containers so runtime env changes apply.
- Production server notes were moved to [documentation/server.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/server.md).
- Implementation-backed core feature documentation now exists in [documentation/core-features.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/core-features.md).
- A new detailed Phase 9 execution plan now exists in [context/plan/70-phase-9-frontend-architecture-and-quality.md](/Users/aman/Projects/personal-projects/Learn-Language/context/plan/70-phase-9-frontend-architecture-and-quality.md).
- Phase 9 is ordered to avoid wasted work:
  - architecture boundary first
  - React Query and async UX standardization second
  - shared loading/skeleton states third
  - responsive/mobile hardening fourth
  - comprehensive backend/frontend/E2E/smoke coverage after refactor surfaces stabilize

## Current blockers

- No implementation blocker identified for planning.
- `P7-004` remains historically blocked by network/package constraints for Next.js migration, but it is not the current execution track.

## Immediate next actions

- Start `P9-001` and create the frontend architecture baseline with a concrete page/feature/service/presentational boundary inventory.

---

Date: 2026-02-21  
Session owner: Codex  
Last completed task ID: P7-003  
Current in-progress task ID: P7-004  
Next task ID: -

## Current state

- Phase 4 is complete and closed.
- Audio/visual answer feedback effects are implemented (`P5-006`).
- Single command quality gate exists: `pnpm run lint`.
- Future roadmap approved and converted into executable Phase 6 backlog.
- Language-isolation endpoint matrix created with per-endpoint scoped behavior + test ownership.
- Cross-language leakage integration coverage added and running in default lint pipeline.
- Storage query audit completed and submit-answer path now enforces selected language boundary.
- Leaderboard language-window behavior validated with integration assertions (`daily`, `weekly`, `all_time`).
- Content validator now enforces transliteration-collision, pronunciation-quality, and tag/cluster consistency gates.
- Environment parity gate is complete: CI now uses pnpm workflow with legacy schema prep + migration parity, and DB integration tests skip only when DB is unavailable locally.
- Review governance v2 schema is now active across DB + API with reviewer confidence score, secondary-review flag, and disagreement status fields.
- Conflict queue + resolution workflow is active with reviewer-only endpoints and integration coverage validating disagreement -> resolved audit trace.
- SRS config versioning is live with `srs_configs`, version-stamped progress updates, and fallback-safe default config resolution.
- Per-direction memory strengths are now persisted and used for scheduling priority + stats (`source->target` vs `target->source`).
- SRS drift monitoring is active with alert-friendly summary endpoint (`/api/admin/srs/drift`).
- Phase 6 core hardening (`P6-001` to `P6-011`) is complete.
- Context hygiene pass is complete: active context is now minimized in `context/plan`, and completed phase docs are archived under `context/archive`.
- Reviewer/admin create-vocabulary flow is now live in UI + API, with required pronunciation/meaning/examples and automatic insertion into draft review lifecycle.
- Optional audio URL support is now available in reviewer/admin vocabulary creation flow and persisted on words without affecting text-first flows.
- Optional `listen_identify` mode is now supported end-to-end for audio-enabled words.
- Optional image hints are now supported end-to-end (`imageUrl` on words + quiz payload + UI rendering fallback-safe).

## Current blockers

- `P7-004` backend Next.js migration is blocked by package installation constraints in the current environment:
  - `pnpm add next@15.2.0` fails with `ERR_PNPM_META_FETCH_FAIL` (`getaddrinfo ENOTFOUND registry.npmjs.org`)
  - without Next.js packages, runtime migration cannot be completed safely

## Immediate next actions

- `P7-004` is now the active long-running item; blocked in this environment due package installation/network constraints required for Next.js runtime migration.
