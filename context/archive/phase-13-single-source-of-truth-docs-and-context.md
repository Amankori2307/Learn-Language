# Phase 13 - Single Source Of Truth For Docs And Context

## Objective

Define and enforce one durable ownership model across `documentation/` and `context/` so every category of repo knowledge has exactly one canonical home, with all other locations reduced to short references or historical archive only.

## Why this phase exists

The repository now has a clearer separation between canonical documentation and archived task-era notes, but the combined system across `documentation/`, `context/active-tasks/`, `context/future-tasks/`, and `context/archive/` still needs one explicit ownership plan.

Without that plan, drift will reappear in these forms:

- the same product or architecture truth repeated in both `documentation/` and `app-context.md`
- implementation-backed rules split across multiple canonical docs
- active task planning leaking back into canonical docs
- archived phase notes being mistaken for current source of truth

## Target ownership model

### `documentation/`

Owns canonical current-state documentation only:

- product behavior and capability summaries
- architecture contracts
- operational runbooks and runtime rules
- governance rules

It must not own:

- active tasks
- future tasks
- phase execution plans
- migration status tracking
- historical decision logs once they are no longer canonical

### `context/active-tasks/app-context.md`

Owns the compact current execution handoff only:

- current app state at a high level
- important constraints and quality gates
- short references to canonical documentation
- active execution state

It must not own:

- deep implementation detail already documented canonically
- detailed plans
- large product/architecture explanations

### `context/active-tasks/backlog.md`

Owns the active queue only.

### `context/future-tasks/backlog.md`

Owns deferred or candidate work only.

### `context/archive/`

Owns historical execution material:

- completed phase files
- superseded documentation snapshots
- detailed run logs
- historical matrices and migration writeups

## Canonical source-of-truth matrix

| Knowledge type | Canonical home | Non-canonical references allowed? |
| --- | --- | --- |
| Product capability summary | `documentation/product/*` | Yes, short summary in `app-context.md` |
| Architecture rules | `documentation/architecture/*` | Yes, brief pointer from `app-context.md` or planning files |
| Ops/runtime/security/testing runbooks | `documentation/operations/*` | Yes, brief pointer only |
| Governance and coding policies | `context/guidelines/*` | Yes, but do not duplicate the rule text across multiple guideline files unless necessary |
| Current app handoff summary | `context/active-tasks/app-context.md` | No parallel long-form duplicate |
| Active execution plan | `context/active-tasks/backlog.md` or active phase file | No |
| Future candidate work | `context/future-tasks/backlog.md` | No |
| Historical task/detail records | `context/archive/*` | Yes, but archive only |

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P13-001 | done | Define the final canonical source-of-truth map | - | M | Every major knowledge category has one explicit owner and overlap rules |
| P13-002 | done | Consolidate overlapping canonical docs where one doc can own the rule | P13-001 | L | The canonical doc set is smaller and each surviving doc has a clear purpose |
| P13-003 | done | Reduce `app-context.md` to handoff-only content with links to canonical docs | P13-001 | M | `app-context.md` stops duplicating durable doc content |
| P13-004 | done | Enforce the documentation-vs-task boundary in repo rules and checks | P13-001 | M | The written rules and lint checks agree on the filesystem boundary |
| P13-005 | done | Archive or delete superseded non-canonical material after consolidation | P13-002, P13-003, P13-004 | M | No obsolete duplicate source-of-truth files remain in active canonical locations |

## Execution map

### P13-001 - Define ownership

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P13-001A | done | Inventory all remaining canonical docs and active context files | - | Every surviving doc/context file is mapped to a purpose |
| P13-001B | done | Write a permanent source-of-truth policy into repo guidance | P13-001A | The ownership model is documented once and referenced consistently |

### P13-002 - Consolidate canonical docs

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P13-002A | done | Merge overlapping frontend canonical docs if one contract can replace several | P13-001 | Frontend canonical docs are minimized without losing durable rules |
| P13-002B | done | Merge overlapping ops/testing docs where one runbook can own the rule | P13-001 | Ops/testing canonical docs avoid duplicate coverage narratives |

### P13-003 - Tighten active context

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P13-003A | done | Remove duplicated durable detail from `app-context.md` | P13-001 | `app-context.md` becomes short and handoff-focused |
| P13-003B | done | Keep only high-value doc references in `app-context.md` | P13-003A | The file points to canon instead of restating it |

### P13-004 - Enforce the boundary

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P13-004A | done | Align planning and code guidelines on the boundary | P13-001 | Both guideline files describe the same rule |
| P13-004B | done | Extend automated checks if needed beyond the current documentation-boundary script | P13-004A | Drift is caught automatically when possible |

### P13-005 - Archive and prune

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P13-005A | done | Move superseded non-canonical files into archive history | P13-002, P13-003 | Old material remains discoverable but non-canonical |
| P13-005B | done | Delete redundant duplicates that are fully replaced elsewhere | P13-005A | No duplicate current-truth files remain |

## Done-when

- every major knowledge category has one canonical owner
- `documentation/` contains only canonical current-state docs
- `context/active-tasks/` contains only current execution context and active planning
- `context/future-tasks/` contains only deferred work
- `context/archive/` contains historical execution and superseded documentation snapshots
- `app-context.md` is reduced to handoff context, not long-form canonical documentation
- repo checks and written guidelines enforce the same boundary

## Notes

- Prefer consolidation over proliferation.
- If two docs can be replaced by one clearer canonical document, merge them.
- Historical detail should be archived, not left beside canonical truth.
