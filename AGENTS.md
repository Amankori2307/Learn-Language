# Repository Instructions

## Start Here

Read these files first for repo context:

1. `context/guidelines/code-guidelines.md`
2. `context/guidelines/planning-guidelines.md`
3. `context/active-tasks/app-context.md`
4. `context/active-tasks/backlog.md`

## Context Rules

- `context/guidelines` contains stable instructions and coding rules.
- `context/active-tasks` contains the active backlog and current app context only.
- `context/archive` contains completed or inactive planning files.
- Do not treat archived files as active backlog unless they are explicitly restored.

## Working Rules

- Follow the active backlog in `context/active-tasks/backlog.md`.
- Keep `context/active-tasks/app-context.md` compact and factual.
- Treat `context/guidelines/planning-guidelines.md` as the authority for phase creation, naming, execution, and archiving rules.
- Keep implementation truth in code and implementation-backed docs, not in stale planning notes.

## UI / Theme Rules

- New reusable UI components must be theme-aware by default.
- Prefer semantic theme tokens and shared variants over raw palette classes or one-off hex values.
- Do not assume only `light` and `dark`; components should work with the implemented named themes.
- If a reusable visual state is missing, add it through the shared token or variant system.
