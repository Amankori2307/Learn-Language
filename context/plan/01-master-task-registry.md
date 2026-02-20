# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Only active and pending tasks are listed here. Completed tasks are intentionally removed.

## Release-critical (current)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4-005 | doing | Beta readiness checklist and release gate sign-off | - | S | core release criteria are green and documented |
| P4B-007 | doing | Build reviewer queue and reviewer role permissions | P4B-006 | M | only reviewer/admin can approve/reject entries |
| P4B-008 | todo | Enforce approval gate in learning flows (exclude non-approved vocab from learner sessions) | P4B-007 | M | quiz/search/stats default to approved vocabulary only |
| P4B-009 | todo | Add source evidence and change history on each vocab item | P4B-006 | M | reviewer can inspect source + edit trail for each word |
| P4B-010 | todo | Add reviewer productivity tooling (bulk approve/reject, reviewer notes, conflict handling) | P4B-007 | M | reviewer throughput improved with auditable actions |
| P4B-011 | todo | Keep AI/manual vocabulary creation draft-only until reviewer action | P4B-006 | S | generated entries never auto-publish to learner flows |

## Platform and DX

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4B-013 | todo | Docker compose hot reload validation and docs update | - | S | backend + frontend reflect code changes without rebuilding image |
| P4B-014 | todo | Add role bootstrap flow for first reviewer/admin user | P4B-007 | S | secure way exists to assign reviewer/admin roles |
| P4B-015 | todo | Add DB migration/backfill scripts for new review/role columns | P4B-006 | S | existing environments migrate safely |
| P4B-016 | todo | Add endpoint-level authorization tests for reviewer actions | P4B-007 | M | non-reviewers blocked and reviewers allowed in tests |
| P4B-017 | todo | Add UI integration tests for profile save + reviewer queue actions | P4B-007 | M | regression suite covers critical user paths |

## Deferred media phase (last)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | todo | Add optional audio URL support end-to-end (non-blocking) | P4-005 | M | text flow still works when audio is missing |
| P5-002 | todo | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | todo | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
| P5-004 | todo | Add media moderation/storage policy and cost controls | P5-001 | S | quotas + policy are documented and enforced |
| P5-005 | todo | Media QA + accessibility pass | P5-002,P5-003 | M | captions/alt/fallback behavior validated |

## Exit criteria

- Reviewer governance is fully enforced before broad content scaling.
- Approval gate is active before non-reviewed vocabulary is introduced.
- Media tasks start only after text-first and review-governance gates are complete.
