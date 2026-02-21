# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Only active and pending tasks are listed here. Completed tasks are intentionally removed.

## Phase 6 - Core hardening (current)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P6-001 | done | Build language-isolation endpoint matrix and implementation checklist for all learner-facing APIs (`quiz`, `stats`, `attempts`, `clusters`, `leaderboard`, `words`) | - | S | checklist maps every endpoint to expected `(userId, language)` behavior with test ownership |
| P6-002 | done | Add integration tests that prove no cross-language progress/stats leakage across endpoints | P6-001 | M | test suite fails if Telugu activity affects Hindi (or any other language) views for same user |
| P6-003 | done | Harden storage queries to enforce language filters consistently (including edge fallback paths) | P6-001 | M | query audit shows no unscoped learner data reads in core learning flows |
| P6-004 | done | Add language-aware leaderboard/stat analytics validation (windowed + all-time) | P6-002,P6-003 | M | leaderboard/stat windows reflect only selected language attempts/progress |
| P6-005 | done | Extend content validators with strict quality gates (duplicate transliteration collision, empty/low-quality pronunciation, inconsistent cluster/tag mappings) | P6-001 | M | invalid content fails `pnpm run lint` with actionable errors |
| P6-006 | done | CI/compose parity check for lint/test/content pipeline and deterministic DB bootstrap | P6-004,P6-005 | S | same command set passes in local + docker + GitHub Actions without manual overrides |
| P6-007 | done | Review governance v2 schema: reviewer confidence, secondary review requirement, disagreement marker | P6-006 | M | DB + API contracts support confidence/disagreement workflow fields |
| P6-008 | todo | Review governance v2 queue/actions: conflict queue + dual-review resolution flow | P6-007 | M | reviewers can resolve disagreement cases with complete audit trail |
| P6-009 | todo | SRS config versioning (stored + auditable), including safe defaults and rollback path | P6-006 | M | scheduling logic is config-versioned and reversible without data loss |
| P6-010 | todo | Add per-direction memory strength model (`source->target` vs `target->source`) into scheduling + stats | P6-009 | L | repetition frequency adapts per direction and direction metrics are exposed |
| P6-011 | todo | Add SRS drift/overdue monitor checks and alert-friendly summary endpoint | P6-010 | S | system can detect scheduling anomalies before they affect learner sessions |
| P6-012 | todo | Context hygiene pass: remove done-task planning files from active context and keep `APP_CONTEXT.md` as single execution source of truth | P6-006 | S | active context folder contains only essential current docs, and `APP_CONTEXT.md` fully captures product scope, architecture, workflows, constraints, and next actions |
| P6-013 | todo | Add reviewer/admin "Create Vocabulary" flow (UI + API) that inserts entries directly into normal review lifecycle (draft/pending_review only) | P6-007 | M | reviewer/admin can submit vocab with language/source/pronunciation/meaning/POS/examples, entry appears in review queue with audit metadata, and learner flows remain approval-gated |

## Phase 5 - Media expansion (deferred; execute after Phase 6)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | todo | Add optional audio URL support end-to-end (non-blocking) | P6-006 | M | text flow still works when audio is missing |
| P5-002 | todo | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | todo | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
| P5-004 | todo | Add media moderation/storage policy and cost controls | P5-001 | S | quotas + policy are documented and enforced |
| P5-005 | todo | Media QA + accessibility pass | P5-002,P5-003 | M | captions/alt/fallback behavior validated |

## Exit criteria

- Core learning correctness is stable across languages and environments.
- Reviewer governance v2 is enforceable and auditable.
- SRS behavior is measurable, versioned, and resilient.
- Media tasks start only after the Phase 6 hardening gate is complete.
