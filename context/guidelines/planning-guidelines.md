# Planning Guidelines

This file is the canonical source for how planning and phase files should be created, named, updated, and archived.

## Purpose

- keep active execution context small
- preserve detailed phase history for future reference
- make phase planning predictable across sessions
- separate planning rules from coding rules

## Folder ownership

- `context/active-tasks`
  - active execution files only
  - currently:
    - `backlog.md`
    - `app-context.md`
- `context/archive`
  - completed or inactive phase/task/history files
- `context/guidelines`
  - stable planning and coding instructions

## Active planning files

### `context/active-tasks/backlog.md`

Use this as the active backlog only.

It should contain:

- active `todo`
- active `doing`
- active `blocked`

It should not contain:

- completed task history
- long narrative summaries
- inactive future ideas

### `context/active-tasks/app-context.md`

Use this as the compact current-state summary.

It should contain:

- current product/repo state
- current durable capabilities
- current quality/runtime constraints
- current execution state
- important local caveats that matter for the next session

It should not contain:

- detailed phase execution logs
- long completed-task history
- duplicate implementation detail that already lives in `documentation/`
- rolling session chatter or temporary notes that do not matter after the next handoff

## Planning lifecycle

Use this sequence every time planning starts or resumes:

1. read `AGENTS.md`
2. read `context/guidelines/planning-guidelines.md`
3. read `context/guidelines/code-guidelines.md`
4. read `context/active-tasks/app-context.md`
5. read `context/active-tasks/backlog.md`
6. decide whether the next slice is:
   - a small standalone task that can live directly in `backlog.md`, or
   - a larger phase/subphase that needs its own phase file
7. if a phase file is needed:
   - create it in `context/active-tasks/`
   - define the task breakdown, sequencing, and exit criteria there
   - keep `backlog.md` pointing to the currently active executable item from that phase
8. execute work in dependency order
9. update implementation docs and active context as the work lands
10. when the phase finishes:
   - summarize the gist in `app-context.md`
   - remove completed items from `backlog.md`
   - move the phase file to `context/archive/`

## When to use only `backlog.md`

Use `backlog.md` without a phase file when:

- the work is a single coherent task
- there is no meaningful microtask/dependency graph
- the breakdown would be overhead rather than clarity

Good examples:

- one bug fix
- one documentation correction
- one small refactor with obvious scope

## When to create a phase file

Create a phase file when:

- the work has multiple tasks or microtasks
- dependency order matters
- the work will likely span multiple commits or sessions
- you want a durable detailed record of what was planned and how it was executed

## Phase file rules

Create a dedicated phase file when:

- a phase has multiple tasks or microtasks
- ordering/dependencies matter
- detailed execution history will be useful later

Do not create a dedicated phase file when:

- the work is a small one-off task
- the task can live cleanly in `backlog.md`
- the work has no meaningful substructure

Phase files should live in:

- `context/active-tasks/` while active
- `context/archive/` once completed or intentionally paused/inactive

## Phase file naming

Use human-readable names.

Preferred patterns:

- top-level phase:
  - `phase-10-platform-hardening-and-product-intelligence.md`
- subphase:
  - `phase-10b-security-hardening.md`
- deeper follow-up when truly needed:
  - `phase-10ba-runtime-topology-follow-up.md`

Rules:

- keep the filename readable
- keep the phase relationship obvious
- avoid artificial numeric sort prefixes like `80-`, `81-`, `99-`
- use lowercase kebab-case
- only go deeper than one letter when it materially helps understanding

## Task status vocabulary

Allowed statuses:

- `todo`
- `doing`
- `done`
- `blocked`

Do not invent alternate status words for planning files.

## Backlog format

`backlog.md` should stay small and operational.

Recommended columns:

- `ID`
- `Status`
- `Task`
- `Notes`

If the active work belongs to a phase file:

- use the phase task ID in `backlog.md`
- keep the wording short
- use `Notes` to point to the owning phase file when helpful

Example:

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| P14-003 | doing | Implement quiz session resume flow | See `context/active-tasks/phase-14-quiz-session-hardening.md` |

## Suggested phase file structure

Recommended sections:

1. title
2. objective/scope
3. phase tasks table
4. micro-task execution map
5. dependencies or sequencing notes
6. exit criteria / done-when expectations
7. optional commit slicing notes when useful

## Suggested phase file template

```md
# Phase 14 - Quiz Session Hardening

## Objective

One short paragraph explaining the phase goal.

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P14-001 | todo | ... | - | M | ... |

## Micro-task execution map

### P14-001 - Example task

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-001A | todo | ... | - | ... |

## Sequencing notes

- optional ordering notes

## Exit criteria

- what must be true for the phase to be complete

## Commit slicing

- optional commit grouping notes
```

## Phase task structure

Each phase task should be small enough to verify clearly.

Recommended columns:

- `ID`
- `Status`
- `Task`
- `Depends On`
- `Effort`
- `Done When`

Microtasks should break the phase task into concrete executable steps.

## Execution rules

- always work from the active backlog first
- if a phase file is actively used, its next executable item should agree with `backlog.md`
- mark work `doing` before implementation when maintaining the planning files
- mark work `done` only after implementation, validation, and required doc/context updates are complete
- only one active `doing` item should exist per execution lane unless parallel work is explicitly intentional
- if a task becomes blocked, mark it `blocked` and record the blocker in the owning file instead of silently stalling
- if reprioritization happens, update `backlog.md` first so the current lane is explicit

## Archive rules

- do not delete completed phase files
- move them to `context/archive`
- preserve them as the detailed historical record
- keep only the gist of completed work in `app-context.md`
- archive renamed phase files with their human-readable names intact
- if an older phase file does not exist because it predates the current system, do not reconstruct it speculatively; recreate historical detail only when there is a concrete need

## Documentation rules for planning

- if a completed phase contains durable implementation truth, move that truth into the relevant file under `documentation/`
- archive the phase file even after the durable summary is moved
- do not rely on the phase file as the only long-term source of implementation truth

## Commit guidance for planning work

- planning-only cleanup should still be grouped into coherent commits
- do not mix unrelated planning cleanups with product code unless inseparable
- if planning work supports a concrete task, keep the task ID in the commit message where practical
