# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Only active and pending tasks are listed here. Completed tasks are intentionally removed.

## Release-critical (current)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4-005 | done | Beta readiness checklist and release gate sign-off | - | S | core release criteria are green and documented |
| P4B-007 | done | Build reviewer queue and reviewer role permissions | P4B-006 | M | only reviewer/admin can approve/reject entries |
| P4B-008 | done | Enforce approval gate in learning flows (exclude non-approved vocab from learner sessions) | P4B-007 | M | quiz/search/stats default to approved vocabulary only |
| P4B-009 | done | Add source evidence and change history on each vocab item | P4B-006 | M | reviewer can inspect source + edit trail for each word |
| P4B-010 | done | Add reviewer productivity tooling (bulk approve/reject, reviewer notes, conflict handling) | P4B-007 | M | reviewer throughput improved with auditable actions |
| P4B-011 | done | Keep AI/manual vocabulary creation draft-only until reviewer action | P4B-006 | S | generated entries never auto-publish to learner flows |

## Platform and DX

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4B-013 | done | Docker compose hot reload validation and docs update | - | S | backend + frontend reflect code changes without rebuilding image |
| P4B-014 | done | Add role bootstrap flow for first reviewer/admin user | P4B-007 | S | secure way exists to assign reviewer/admin roles |
| P4B-015 | done | Add DB migration/backfill scripts for new review/role columns | P4B-006 | S | existing environments migrate safely |
| P4B-016 | done | Add endpoint-level authorization tests for reviewer actions | P4B-007 | M | non-reviewers blocked and reviewers allowed in tests |
| P4B-017 | done | Add UI integration tests for profile save + reviewer queue actions | P4B-007 | M | regression suite covers critical user paths |
| P4B-018 | done | Replace dummy MVP seed with real source language core vocabulary from internal knowledge | P4B-011 | M | assets seed provides realistic beginner source language words/phrases with transliteration/examples |

## Phase 4C - Words-first learning flow (active)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4C-001 | done | Finalize product prompt/spec for words-first flow and sentence-as-feedback behavior | P4B-018 | S | spec clearly defines word vs sentence responsibilities and acceptance criteria |
| P4C-002 | done | Persist sentence pronunciation in `word_examples` and wire importer/backfill behavior | P4C-001 | M | each example row stores sentence + pronunciation + meaning |
| P4C-003 | done | Restrict quiz question generation to word-only directions (no sentence question prompts) | P4C-001 | S | learner question prompt is always a word/phrase item |
| P4C-004 | done | Update submit/feedback payload to always return example sentence triplet | P4C-002,P4C-003 | M | feedback shows sentence + pronunciation + meaning after answer |
| P4C-005 | done | Update quiz feedback UI copy/layout for words-first + example triplet rendering | P4C-004 | M | result panel consistently shows readable sentence/pronunciation/meaning block |
| P4C-006 | done | Add tests + docs updates for words-first flow and example guarantees | P4C-002,P4C-005 | M | automated checks cover behavior and docs reflect new flow |

## Deferred media phase (last)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | todo | Add optional audio URL support end-to-end (non-blocking) | P4-005 | M | text flow still works when audio is missing |
| P5-002 | todo | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | todo | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
| P5-004 | todo | Add media moderation/storage policy and cost controls | P5-001 | S | quotas + policy are documented and enforced |
| P5-005 | todo | Media QA + accessibility pass | P5-002,P5-003 | M | captions/alt/fallback behavior validated |

## Phase 4D - Code standards rollout

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4D-001 | done | Publish code guidelines for modularity + enums + interface naming | P4C-006 | S | guideline doc is present and referenced in planning context |
| P4D-002 | done | Introduce shared enums/interfaces baseline and migrate core auth/quiz/review contracts | P4D-001 | M | core domains no longer rely on duplicated literal unions |
| P4D-004 | done | Consolidate processed seed artifacts into single source file (`assets/processed/seed.json`) | P4D-002 | S | only one processed seed file is used by scripts/runtime/docs |
| P4D-003 | done | Incrementally replace remaining magic strings and unprefixed reusable interfaces repo-wide | P4D-002 | L | majority of feature modules consume shared enums/interfaces |

## Phase 4E - Generic language pivot (active)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4E-001 | done | Remove `source_language` naming from codebase and use generic source-language naming (keep `LanguageEnum.source_language` as single language-specific token) | P4D-003 | L | code identifiers, API contracts, storage interfaces, and UI copy no longer use `source_language`-specific naming |
| P4E-002 | done | Enforce naming consistency repo-wide after generic pivot (single canonical naming for source script/text across schema, API, UI, scripts, tests) | P4E-001 | M | no mixed legacy naming remains and lint/type/tests pass with a uniform vocabulary |
| P4E-003 | done | Setup Drizzle migration workflow (generate/migrate scripts + migration folder conventions) and stop relying on schema push for lifecycle changes | P4E-002 | M | versioned migrations are generated/applied via scripts and validated in docs/compose flow |
| P4E-004 | todo | Add language selector in UI and scope progress/statistics/session state by `(userId, language)` combination | P4E-003 | L | learners can switch language context and all progress/review/stats/attempts are isolated per language |

## Exit criteria

- Reviewer governance is fully enforced before broad content scaling.
- Approval gate is active before non-reviewed vocabulary is introduced.
- Media tasks start only after text-first and review-governance gates are complete.
