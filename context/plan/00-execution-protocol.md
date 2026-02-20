# Execution Protocol (Agent-Ready)

This protocol ensures work can stop and resume cleanly across days and credit limits.

## Task status model

Use these values in every phase file and in the master registry:
- `todo`
- `doing`
- `done`
- `blocked`

## Sequencing rules

1. Always pick the lowest-ID `todo` task with all dependencies marked `done`.
2. Mark that task `doing` before making code changes.
3. Complete implementation + tests + docs for that task.
4. Mark task `done` only if all acceptance checks pass.
5. If blocked, mark `blocked`, write blocker notes, and move only to the next unblocked task in same phase.
6. Do not start next phase until current phase exit criteria are satisfied.

## Commit protocol (recommended)

- One task per commit where possible.
- Commit message format:
`[TASK <ID>] <short description>`
- If a task is large, use:
`[TASK <ID>][PART <n>] <short description>`

## Stop/Resume protocol

When session ends:
1. Update `99-daily-run-log.md`.
2. Ensure one clear "next task" is listed.
3. Ensure partial work has notes and file paths.

When session starts:
1. Read `99-daily-run-log.md` latest entry.
2. Continue from recorded `next_task_id`.
3. Revalidate dependencies before executing.

## Acceptance gate per task

A task is `done` only if all are true:
- Feature behavior implemented.
- Validation/error cases handled.
- Tests added or updated.
- Build/lint/tests pass for impacted area.
- Docs/task checklist updated.

## Risk controls

- Keep schema changes backward-compatible inside a phase when possible.
- Avoid large refactors mixed with feature tasks.
- If schema changes are required, include migration + rollback notes.

