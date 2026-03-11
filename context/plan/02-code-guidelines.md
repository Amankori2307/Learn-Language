# Code Guidelines (Enforced Baseline)

## Goals

- Keep code modular and cohesive by domain.
- Centralize string constants with enums.
- Standardize interface naming for API/domain contracts.
- Keep logic separate from UI rendering so visual layer swaps are low-risk.
- Eliminate magic numbers via named constants/enums.
- Keep delivery flow disciplined so phase work lands on isolated branches and production automation stays tied to `main`.

## Rules

1. Modularity:

- Keep domain constants/types in `shared/domain/*`.
- Keep route contracts in `shared/routes.ts`.
- Keep DB models in `shared/schema.ts`.
- Keep auth logic under `server/auth/*`.

2. Enum-first constants:

- Do not repeat magic strings for roles, statuses, directions, modes, or question types.
- Use shared enums from `shared/domain/enums.ts`.
- In Zod contracts, prefer `z.nativeEnum(...)`.

3. Interface naming:

- For reusable domain/API shapes, use `I` prefix:
  - Example: `IUser`, `IQuizAttemptHistoryItem`.
- Keep table infer types where needed, but expose interface aliases for app-level usage.

4. Type boundaries:

- Shared types/enums must be imported by both client and server where applicable.
- Avoid creating duplicate union literals in feature files.
- Do not define reusable interfaces/enums/constants inside controller/service/repository files.
- Place them in domain-owned modules (shared domain or feature `types/constants` files).

5. UI/logic separation:

- Keep business logic, data shaping, and side effects in hooks/services/view-model helpers.
- Keep presentational components focused on rendering and event wiring.
- UI libraries/components should be replaceable without rewriting business logic.

6. No magic numbers:

- Do not hardcode unexplained numeric literals in business logic.
- Use named constants/enums for thresholds, limits, scoring weights, retries, timeouts, and page sizes.
- Local numeric literals are acceptable only when self-evident and domain-neutral (e.g., array index `0`/`1` in trivial loops).

7. Backward-compatible migration approach:

- Introduce enum/type wrappers first.
- Replace scattered string literals incrementally by phase.
- Keep CI green after each module migration.

8. Lint policy (zero warnings):

- `pnpm run lint` must pass with `--max-warnings=0`.
- Do not merge code with ESLint warnings.
- Treat `react-refresh/only-export-components` and `@typescript-eslint/no-unused-vars` as errors.

9. Planning hygiene:

- Treat `context/plan/01-master-task-registry.md` as active backlog only.
- When a phase or task is complete, mark it done once, migrate durable outcomes into feature documentation or `APP_CONTEXT.md`, and remove its detailed execution tracking from active planning files.
- Do not keep completed phase breakdowns in `context/plan` just for history; keep only unfinished phases or genuinely active strategy docs there.
- If a completed phase still contains information worth retaining, fold that information into implementation-backed docs such as feature docs, server/deploy docs, or architecture baselines before removing the phase plan from active context.

10. Branch workflow:

- Start each new phase on a new git branch.
- Use one branch per phase; do not stack multiple active phases on the same long-lived branch.
- Recommended naming: `phase-<number>-<short-scope>` or equivalent team-approved phase naming.
- Keep `main` as the integration and deployment branch.
- Merge a phase branch into `main` only after its scoped work is verified and ready for integration.
- CI/CD should be treated as `main`-driven only; do not assume non-`main` branches deploy automatically.
- If a phase is large, use short-lived sub-branches off the phase branch only when necessary, then merge them back into the phase branch before merging to `main`.
- Before starting the next phase, branch from the latest `main` unless there is an explicit reason to branch from another approved integration branch.

11. Commit hygiene:

- Commit once you have a sizable, coherent set of changes.
- Commit when you complete a major logical task, not only at the very end of a long phase.
- Prefer commits that represent one meaningful unit of progress and can be understood or reverted independently.
- Do not mix unrelated fixes, refactors, and feature work into the same commit unless they are inseparable for correctness.

## Adoption plan

- Phase 4D:
  - D1: publish guidelines + shared enums baseline.
  - D2: migrate auth + quiz/review contract constants to enums.
  - D3: gradual repo-wide cleanup of remaining literals.
