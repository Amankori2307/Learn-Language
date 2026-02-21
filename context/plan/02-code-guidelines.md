# Code Guidelines (Enforced Baseline)

## Goals

- Keep code modular and cohesive by domain.
- Centralize string constants with enums.
- Standardize interface naming for API/domain contracts.

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

5. Backward-compatible migration approach:
- Introduce enum/type wrappers first.
- Replace scattered string literals incrementally by phase.
- Keep CI green after each module migration.

6. Lint policy (zero warnings):
- `pnpm run lint` must pass with `--max-warnings=0`.
- Do not merge code with ESLint warnings.
- Treat `react-refresh/only-export-components` and `@typescript-eslint/no-unused-vars` as errors.

## Adoption plan

- Phase 4D:
  - D1: publish guidelines + shared enums baseline.
  - D2: migrate auth + quiz/review contract constants to enums.
  - D3: gradual repo-wide cleanup of remaining literals.
