# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Only active and pending tasks are listed here. Completed tasks are intentionally removed.

## Immediate Phase 6 extension

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P6-012 | done | Context hygiene pass: keep only essential active docs in `context/plan` and make `APP_CONTEXT.md` the execution source of truth | P6-011 | S | `context/plan` has only active docs, completed phase docs are archived, and `APP_CONTEXT.md` reflects current architecture/features/workflows/constraints |
| P6-013 | done | Add reviewer/admin "Create Vocabulary" flow (UI + API) that inserts entries directly into normal review lifecycle (draft/pending_review only) | P6-008 | M | reviewer/admin can submit vocab with language/source/pronunciation/meaning/POS/examples, entry appears in review queue with audit metadata, and learner flows remain approval-gated |

## Immediate Phase 6 extension - active

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P6-022 | todo | Maintain zero-warning lint baseline and prevent regressions across new PRs | - | S | `pnpm run lint` remains warning-free with `--max-warnings=0`; guideline rule is enforced and no warning-level lint rules are reintroduced |

## Phase 5 - Media expansion (deferred)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | done | Add optional audio URL support end-to-end (non-blocking) | P6-013 | M | text flow still works when audio is missing |
| P5-002 | done | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | done | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
