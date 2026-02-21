# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Only active and pending tasks are listed here. Completed tasks are intentionally removed.

## Immediate Phase 6 extension

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P6-012 | done | Context hygiene pass: keep only essential active docs in `context/plan` and make `APP_CONTEXT.md` the execution source of truth | P6-011 | S | `context/plan` has only active docs, completed phase docs are archived, and `APP_CONTEXT.md` reflects current architecture/features/workflows/constraints |
| P6-013 | done | Add reviewer/admin "Create Vocabulary" flow (UI + API) that inserts entries directly into normal review lifecycle (draft/pending_review only) | P6-008 | M | reviewer/admin can submit vocab with language/source/pronunciation/meaning/POS/examples, entry appears in review queue with audit metadata, and learner flows remain approval-gated |

## Phase 5 - Media expansion (deferred)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | done | Add optional audio URL support end-to-end (non-blocking) | P6-013 | M | text flow still works when audio is missing |
| P5-002 | todo | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | todo | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
| P5-004 | todo | Add media moderation/storage policy and cost controls | P5-001 | S | quotas + policy are documented and enforced |
| P5-005 | todo | Media QA + accessibility pass | P5-002,P5-003 | M | captions/alt/fallback behavior validated |
