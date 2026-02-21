# Phase 6 - Core Hardening Execution Plan

Status: `complete`

Objective: enforce data correctness, review-quality governance, and scheduling reliability before broader media expansion.

## Execution order (must follow)

1. P6-001
2. P6-002
3. P6-003
4. P6-004
5. P6-005
6. P6-006
7. P6-007
8. P6-008
9. P6-009
10. P6-010
11. P6-011

---

## P6-001 - Language-isolation endpoint matrix
Status: `done`
Depends on: `-`

Scope:
- Create endpoint matrix covering:
  - `/api/quiz/generate`
  - `/api/stats`
  - `/api/attempts/history`
  - `/api/clusters`
  - `/api/clusters/:id`
  - `/api/leaderboard`
  - `/api/words`
- For each endpoint define:
  - required inputs
  - language-scoping rules
  - expected empty-state behavior
  - ownership test file

Acceptance criteria:
- Matrix document exists and is referenced in implementation/test files.
- Every endpoint has an explicit expected behavior for `(userId, language)`.

Deliverable:
- `context/plan/93-language-isolation-endpoint-matrix.md`

---

## P6-002 - Cross-language leakage integration tests
Status: `done`
Depends on: `P6-001`

Scope:
- Add integration tests that:
  - seed attempts/progress in language A and B for same user
  - verify requests with `language=A` never include B activity
  - verify requests with `language=B` never include A activity

Acceptance criteria:
- Failing behavior is reproducible if scoping is removed.
- Passing tests cover quiz generation, stats, attempts, leaderboard at minimum.

Deliverable:
- `server/storage.language-isolation.integration.test.ts`

---

## P6-003 - Storage query hardening
Status: `done`
Depends on: `P6-001`

Scope:
- Audit `server/storage.ts` and all fallback paths for unscoped reads.
- Ensure language filter is consistently applied in learner-facing calls.
- Remove/guard any legacy fallbacks that bypass language filter.

Acceptance criteria:
- Query audit checklist is completed with no unresolved entries.
- All endpoint handlers pass language through to storage.

Deliverable:
- `context/plan/94-p6-003-storage-query-audit.md`

---

## P6-004 - Leaderboard/stats language-window validation
Status: `done`
Depends on: `P6-002,P6-003`

Scope:
- Validate daily/weekly/all-time windows under language filter.
- Ensure ranking and accuracy are computed from selected-language attempts only.

Acceptance criteria:
- Unit/integration tests verify window correctness by language.
- Manual QA script demonstrates expected ranking changes per language switch.

Deliverable:
- `server/storage.language-isolation.integration.test.ts` (windowed leaderboard assertions)

---

## P6-005 - Strict content validator gates
Status: `done`
Depends on: `P6-001`

Scope:
- Extend `script/validate-content.ts` checks:
  - duplicate transliteration collisions (same language + conflicting meanings)
  - pronunciation quality floor (min length, non-placeholder patterns)
  - cluster/tag consistency rules
  - example triplet completeness strictness

Acceptance criteria:
- Invalid seed rows fail with actionable errors.
- Valid current seed passes without warnings.

Deliverable:
- `script/validate-content.ts` extended with collision/quality/consistency checks

---

## P6-006 - Environment parity gate (local/docker/CI)
Status: `done`
Depends on: `P6-004,P6-005`

Scope:
- Standardize one command set for validation in:
  - local shell
  - docker compose app container
  - GitHub Actions
- Verify deterministic DB bootstrap for compose startup path.

Acceptance criteria:
- No environment-specific script forks are required for core validation.
- CI workflow documents and executes same checks as local baseline.

Deliverable:
- `.github/workflows/ci.yml`
- `server/storage.language-isolation.integration.test.ts` (DB-unavailable local guard)

---

## P6-007 - Review governance v2 schema
Status: `done`
Depends on: `P6-006`

Scope:
- Add schema fields for:
  - reviewer confidence score
  - secondary review requirement flag
  - disagreement marker/status
- Add migration + backfill scripts.

Acceptance criteria:
- DB migration is idempotent and safe for existing rows.
- API contracts expose new fields where needed.

Deliverable:
- `shared/schema.ts`
- `migrations/0002_review_governance_v2.sql`
- `script/migrate-review-governance.ts`
- `script/backfill-review-governance.ts`
- `shared/routes.ts`
- `server/routes.ts`
- `server/storage.ts`

---

## P6-008 - Conflict queue and dual-review workflow
Status: `done`
Depends on: `P6-007`

Scope:
- Add reviewer queue mode for disagreements.
- Add actions for second-review resolution.
- Ensure all state transitions are audited.

Acceptance criteria:
- Reviewer can move item from disagreement -> resolved with history trace.
- Unauthorized users cannot access conflict actions.

Deliverable:
- `shared/routes.ts` (`/api/review/conflicts`, `/api/review/words/:id/resolve-conflict`)
- `server/routes.ts`
- `server/storage.ts`
- `server/review-conflict.integration.test.ts`
- `shared/routes.contract.test.ts`

---

## P6-009 - SRS config versioning
Status: `done`
Depends on: `P6-006`

Scope:
- Introduce versioned SRS config model.
- Store config version used for each scheduling update.
- Add rollback-safe default config path.

Acceptance criteria:
- Scheduling behavior can be traced to a specific config version.
- Config rollback does not corrupt user progress data.

Deliverable:
- `shared/schema.ts` (`srs_configs`, `user_word_progress.srs_config_version`)
- `migrations/0003_srs_config_versioning.sql`
- `server/services/srs-config.ts`
- `server/services/srs-config.test.ts`
- `server/services/srs.ts` (version-aware apply logic)
- `server/routes.ts` (active-config scheduling path)
- `server/storage.ts` (`getActiveSrsConfig` fallback)

---

## P6-010 - Per-direction memory strength model
Status: `done`
Depends on: `P6-009`

Scope:
- Separate recall strength tracking for:
  - `source->target`
  - `target->source`
- Feed direction-specific performance into session generation.

Acceptance criteria:
- Repetition prioritization changes based on weaker direction.
- Stats expose direction-specific progression.

Deliverable:
- `shared/schema.ts` (`source_to_target_strength`, `target_to_source_strength`)
- `migrations/0004_direction_strengths.sql`
- `server/services/srs.ts` (direction-aware strength updates)
- `server/services/quiz-candidate-scoring.ts` (weaker-direction priority bonus)
- `server/storage.ts` + `shared/routes.ts` (`sourceToTargetStrength`, `targetToSourceStrength` in stats)
- `server/services/srs.test.ts`
- `server/services/quiz-candidate-scoring.test.ts`

---

## P6-011 - SRS drift monitor
Status: `done`
Depends on: `P6-010`

Scope:
- Add drift checks:
  - overdue queue growth
  - unexpected interval spikes
  - empty-review-day anomalies
- Expose summary endpoint/log for operations.

Acceptance criteria:
- Drift summary is available and testable.
- Alert-friendly payload is documented and stable.

Deliverable:
- `server/services/srs-drift.ts`
- `server/services/srs-drift.test.ts`
- `server/storage.ts` (`getSrsDriftSummary`)
- `shared/routes.ts` + `server/routes.ts` (`/api/admin/srs/drift`)
- `shared/routes.contract.test.ts`

---

## Completion gate for Phase 6

- P6-001..P6-011 all marked `done`.
- `pnpm run lint` passes in local/docker/CI.
- Cross-language leakage test suite green.
- Review governance v2 + SRS versioning operational.
