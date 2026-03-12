# Code Governance Contract

This document turns the Phase 10 anti-duplication guidance into explicit ownership and enforcement rules.

## Goals

- keep shared contracts and enums discoverable from one obvious location
- stop local feature aliases from silently turning into parallel public contracts
- reduce cleanup churn by failing duplication mistakes early in CI
- keep magic-number cleanup pragmatic instead of turning governance into noisy lint churn

## Ownership rules

### Shared enums

- Shared domain enums belong in [shared/domain/enums.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/domain/enums.ts).
- Database-only enums belong in [server/src/infrastructure/database.enums.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/database.enums.ts).
- New exported enums should not be introduced anywhere else without first promoting them into one of those modules.

### Shared reusable types

- Cross-layer API and domain shapes belong in `shared/*`.
- Module-level reusable server shapes belong in `*.types.ts` or `*.repository.types.ts` files, not in controllers, services, or repositories.
- Reusable client types belong in feature-owned hook/service/lib modules only when they are not shared across domains. If a type becomes cross-feature or cross-layer, promote it into `shared/*`.
- Avoid public alias wrappers that simply restate an existing enum or interface name in another module unless the alias carries genuinely different semantics.

### React Query ownership

- Pages and presentational components must not call `apiClient` directly or define transport-backed `useQuery` / `useMutation` ownership.
- Shared data-access ownership belongs in `client/src/hooks/*`; page-specific orchestration belongs in feature `use-*-view-model.ts` modules.
- The module that defines a shared query must also define the query-key builder used by callers and invalidation sites.
- Prefer stable positional tuple keys:
  - resource key first
  - scope variables next
  - pagination/filter variables last
- Use narrow invalidation by default.
- Broad invalidation is reserved for truly global/admin mutations and should carry explicit rationale.
- Query-behavior overrides such as stale-time or retry exceptions should be centralized in a shared seam instead of repeated as inline literals.

### Magic numbers

- Business-rule numbers such as limits, thresholds, window sizes, retry counts, cache TTLs, and scoring weights must be named constants.
- Small, obvious numeric literals remain acceptable for trivial rendering and language-level mechanics such as `0`, `1`, array indexing, and one-off layout values.
- Enforcement for magic numbers remains a review gate instead of a broad lint rule until the codebase is small enough to adopt it without high-noise cleanup.

## Enforcement

- [script/check-symbol-governance.ts](/Users/aman/Projects/personal-projects/Learn-Language/script/check-symbol-governance.ts) runs in the main lint gate.
- The check currently enforces:
  - exported enums may only live in the approved enum modules
  - exported reusable types/interfaces/enums may not live in `*.controller.ts`, `*.service.ts`, or `*.repository.ts`
  - duplicate exported symbol names are rejected across governed source files
- Drizzle table infer types under `server/src/infrastructure/tables/*` are excluded from duplicate-name enforcement because they are schema-bound storage types rather than app-level contract ownership.

## Review checklist

Before merging a change:

- confirm new shared shapes were added to the correct ownership layer
- confirm no feature file duplicated an existing exported symbol name
- confirm any new threshold, timeout, page size, or scoring number was named if it affects business behavior
- confirm new query ownership lives in shared hooks or feature view-models rather than pages/presentational components
- confirm new shared queries export and reuse a stable key builder instead of scattering tuple literals
- confirm mutation invalidation is intentionally narrow unless the change is explicitly global/admin in scope
- confirm branch workflow still follows the phase-branch to `main` integration model
- confirm commits were split on meaningful logical units instead of unrelated mixed work

## Current status

- The existing duplicate `QuizMode` alias was removed during Phase 10 governance cleanup.
- Remaining same-name storage-model exports under Drizzle table files are intentionally excluded from the automated duplicate-name rule.
