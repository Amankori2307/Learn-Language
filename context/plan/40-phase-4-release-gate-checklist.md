# Phase 4 Release Gate Checklist (P4-005)

Status: `passed`  
Date: 2026-02-20  
Owner: Codex

## Gate Criteria

1. Core text-first learning flows are functional.
2. Review governance is enforced (role-guarded review actions + approval gate).
3. Seed/content quality is production-usable for beta (no placeholder corpus).
4. Local developer runtime is stable (compose startup + hot reload).
5. Regression coverage is in place for critical backend and UI paths.

## Verification Evidence

### 1) Core Flow Quality
- Quiz generation returns real source language entries with transliteration pronunciation metadata.
- Quiz result feedback shows:
  - word/sentence
  - pronunciation
  - meaning
- Contextual mode also surfaces pronunciation.

Result: `pass`

### 2) Review Governance
- Reviewer/admin middleware exists and is tested.
- Review queue/transition/history endpoints are role-protected.
- Learner-facing content fetches approved vocabulary only.

Result: `pass`

### 3) Content Quality
- `assets/processed/seed.json` uses realistic source language seed rows.
- Import pipeline purges legacy placeholder rows (`sample-word-*`, `word-*`, `padam-*`) before MVP import.
- Content validator passes on MVP file.

Result: `pass`

### 4) Runtime Stability (Docker Compose)
- `docker compose up -d --build` succeeds.
- Startup sequence applies schema, migration/backfill, imports MVP dataset, starts dev server.
- Hot reload is active in compose runtime.

Result: `pass`

### 5) Automated Checks
- `pnpm run check` passes.
- `pnpm run test` passes.
- `pnpm run test:ui` passes.
- `pnpm run ci` passes.

Result: `pass`

## Release Decision

Phase 4 release gate is green for beta readiness on text-first scope.  
Move to deferred media phase only when explicitly prioritized.
