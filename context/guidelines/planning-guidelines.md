# Planning Guidelines

This file is the canonical source for how planning and execution files should be created, named, updated, and archived.

## Purpose

- keep active execution context small
- preserve detailed execution history for future reference
- make planning predictable across sessions
- separate planning rules from coding rules

## Folder ownership

- `documentation`
  - canonical current-state documentation only
  - implementation-backed product, architecture, and operations docs
  - must not contain backlog-style plans, execution logs, workflow rules, or historical task archives
- `context/active-tasks`
  - active execution files only
  - currently:
    - `backlog.md`
    - `app-context.md`
- `context/future-tasks`
  - future ideas and intentionally non-active candidate work only
  - currently:
    - `backlog.md`
- `context/archive`
  - completed or inactive planning/history files
  - historical documentation snapshots and superseded planning-era writeups also belong here when they are no longer canonical docs
- `context/guidelines`
  - stable planning and coding instructions
  - canonical home for workflow rules, repository governance, and documentation-boundary policy

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

### `context/future-tasks/backlog.md`

Use this as the parking area for future work only.

It should contain:

- deferred ideas
- possible future work
- candidate execution slices that are not active yet

It should not contain:

- the current active lane
- `doing` work
- completed history
- archival records

## Planning lifecycle

Use this sequence every time planning starts or resumes:

1. read `AGENTS.md`
2. read `context/guidelines/planning-guidelines.md`
3. read `context/guidelines/code-guidelines.md`
4. read `context/active-tasks/app-context.md`
5. read `context/active-tasks/backlog.md`
6. read `context/future-tasks/backlog.md` when you need future-candidate context or are reprioritizing upcoming work
7. decide whether the next slice is:
   - a small standalone task that can live directly in `backlog.md`, or
   - a larger phase/subphase that needs its own phase file
8. if a phase file is needed:
   - create it in `context/active-tasks/`
   - define the task breakdown, sequencing, and exit criteria there
   - keep `backlog.md` pointing to the currently active executable item from that phase
9. execute work in dependency order
10. update implementation docs and active context as the work lands
11. when the phase finishes:
   - summarize the gist in `app-context.md`
   - remove completed items from `backlog.md`
   - move the phase file to `context/archive/`

## Trigger map

Use these trigger rules consistently:

- a new user request starts as triage, not as an automatic phase
- if the work is approved for immediate execution, promote it into `context/active-tasks/backlog.md`
- if the work is real but not approved for immediate execution, put it in `context/future-tasks/backlog.md`
- create a dedicated phase file only when the active work has multiple dependent tasks, likely spans multiple commits or sessions, or needs durable execution history
- if a task grows beyond what fits cleanly in `backlog.md`, promote it into a phase file before implementation sprawls
- if active priorities change, update `context/active-tasks/backlog.md` first and only then continue implementation
- if work is completed or intentionally paused, archive its phase file instead of leaving it in `context/active-tasks/`

## Intake and promotion flow

1. classify the request as one of:
   - immediate active work
   - future candidate work
   - historical/reference-only material
2. choose the canonical home before creating any file:
   - current product, architecture, or operations truth: `documentation/`
   - active execution state: `context/active-tasks/`
   - future work: `context/future-tasks/`
   - historical detail: `context/archive/`
3. if the work is active:
   - add or update the `doing` or `todo` row in `context/active-tasks/backlog.md`
   - create a phase file only if the work meets the phase threshold
4. if the work is not active:
   - do not place it in `documentation/`
   - do not place it in `context/active-tasks/`
   - capture it in `context/future-tasks/backlog.md` if it is a real future candidate

## Definition of ready

Do not start implementation until the active work item has:

- one clear owner file in `context/active-tasks/`
- a defined scope that is small enough to verify
- explicit dependencies when ordering matters
- explicit done-when expectations
- an identified documentation impact when behavior or architecture will change

If those are missing, tighten the active task or create a phase file before writing code.

## Documentation boundary

Use this rule consistently:

- `documentation/` is for canonical current-state documentation only
- `context/active-tasks/` and `context/future-tasks/` are for active and future task planning
- `context/archive/` is for completed planning files, historical execution notes, and superseded documentation snapshots

Do not leave temporary migration notes, task matrices, or status docs in `documentation/` once they stop being the canonical source of truth.

## Single source of truth

Use this ownership model consistently:

- product truth lives in `documentation/product/*`
- architecture truth lives in `documentation/architecture/*`
- operations truth lives in `documentation/operations/*`
- workflow and repository-governance rules live in `context/guidelines/*`
- active handoff context lives in `context/active-tasks/app-context.md`
- active planning lives in `context/active-tasks/*`
- future planning lives in `context/future-tasks/*`
- historical execution and superseded writeups live in `context/archive/*`

Never let the same rule or status live authoritatively in two places. Link to the canonical file instead.

## When to use only `backlog.md`

Use `backlog.md` without a phase file when:

- the work is a single coherent task
- there is no meaningful microtask/dependency graph
- the breakdown would be overhead rather than clarity

Good examples:

- one bug fix
- one documentation correction
- one small refactor with obvious scope

Future ideas that are not yet approved for execution should go into `context/future-tasks/backlog.md`, not the active backlog.

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
- keep only one `doing` row in `backlog.md` unless parallel execution is explicitly intentional

`context/future-tasks/backlog.md` may use the same table format, but it should not contain `doing` items because it is not an execution board.

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
- do not treat `context/future-tasks/backlog.md` as executable work until an item is moved into the active backlog or an active phase file
- if a phase file is actively used, its next executable item should agree with `backlog.md`
- mark work `doing` before implementation when maintaining the planning files
- mark work `done` only after implementation, validation, and required doc/context updates are complete
- only one active `doing` item should exist per execution lane unless parallel work is explicitly intentional
- if a task becomes blocked, mark it `blocked` and record the blocker in the owning file instead of silently stalling
- if reprioritization happens, update `backlog.md` first so the current lane is explicit

## Documentation update triggers

Update canonical documentation in the same change whenever the work alters:

- shipped features or product surface area
- route ownership or route availability
- API contracts, response envelopes, auth behavior, or reviewer/admin access rules
- architecture boundaries, request ownership, async-state handling, or theme behavior
- runtime topology, server behavior, security posture, observability, performance guidance, or release gates

Do not create a planning file to hold durable implementation truth once the change has landed. Move that truth into `documentation/` and keep planning files focused on execution.

## Definition of done

An active task or phase item is not done until all of these are true:

- implementation is complete
- required verification ran
- canonical documentation is updated when needed
- `context/active-tasks/app-context.md` reflects the new durable handoff summary when needed
- `context/active-tasks/backlog.md` reflects the current active lane
- any superseded temporary planning notes are removed or archived

If any one of those is still missing, the item stays `doing` or `blocked`, not `done`.

## Archive rules

- do not delete completed phase files
- move them to `context/archive`
- preserve them as the detailed historical record
- keep only the gist of completed work in `app-context.md`
- archive renamed phase files with their human-readable names intact
- if an older phase file does not exist because it predates the current system, do not reconstruct it speculatively; recreate historical detail only when there is a concrete need
- keep `context/archive/archive-index.md` updated when archive files are added, renamed, or removed

## Archive flow

Archive a phase file when:

- every phase task is `done`, or
- the phase is intentionally paused and no longer belongs in the active lane

Before archiving:

1. finish required implementation-backed doc updates
2. reduce the lasting gist into `context/active-tasks/app-context.md` if it matters for the next session
3. clear completed items from `context/active-tasks/backlog.md`
4. move the phase file into `context/archive/`
5. update `context/archive/archive-index.md`

Never leave a completed phase file in `context/active-tasks/` after its backlog item is gone.

## Maintenance rules

- keep using this planning system consistently instead of falling back to ad hoc notes
- keep `app-context.md` short and durable; remove noise instead of letting it accumulate
- keep `backlog.md` current whenever priorities or active work change
- never let completed work drift back into `backlog.md`
- archive completed phase files rather than deleting them

## Documentation rules for planning

- if a completed phase contains durable implementation truth, move that truth into the relevant file under `documentation/`
- archive the phase file even after the durable summary is moved
- do not rely on the phase file as the only long-term source of implementation truth

## Commit guidance for planning work

- planning-only cleanup should still be grouped into coherent commits
- do not mix unrelated planning cleanups with product code unless inseparable
- if planning work supports a concrete task, keep the task ID in the commit message where practical
