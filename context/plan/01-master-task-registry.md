# Master Task Registry (Ordered)

Status legend: `todo` | `doing` | `done` | `blocked`

## Phase 0 - Foundation

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P0-001 | done | Create/verify env variable contract (`DATABASE_URL`, auth vars, app mode vars) | - | S | `.env.example` and startup validation exist |
| P0-002 | done | Add centralized config module with runtime checks | P0-001 | M | app fails fast with clear config errors |
| P0-003 | done | Baseline code health commands (`lint`, `typecheck`, `test`) and CI script | P0-002 | M | commands pass locally and in CI |
| P0-004 | done | Add error envelope format for API responses | P0-002 | M | all API errors return consistent shape |
| P0-005 | done | Seed command hardening and idempotency checks | P0-001 | S | repeated seed runs do not duplicate data |

## Phase 1 - Data + Content (Text)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P1-001 | done | Normalize schema for words/clusters/sentences/progress fields | P0-003 | M | schema reflects contract in `70-schema-and-api-contracts.md` |
| P1-002 | done | Add DB indexes for quiz selection and review due lookups | P1-001 | S | query plans use indexes for target endpoints |
| P1-003 | done | Implement content import format (CSV/JSON) for text-only vocabulary | P1-001 | M | import script validates and upserts content |
| P1-004 | done | Expand seed dataset to MVP target (300 words, 20 clusters, 100 sentences) | P1-003 | L | seeded DB meets minimum target counts |
| P1-005 | done | Add content quality validation rules (duplicates, transliteration format, missing examples) | P1-003 | M | validation report generated and clean |

## Phase 2 - Quiz + Adaptive SRS (Core)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P2-001 | done | Implement deterministic quiz candidate scoring service | P1-002 | M | score formula matches product contract |
| P2-002 | done | Implement daily session generator v1 (30% review, 50% new, 20% weak) | P2-001 | L | generated session follows composition targets with deterministic ordering |
| P2-003 | done | Implement distractor strategy (cluster -> POS -> transliteration -> random) | P2-002 | M | options are unique and quality-ranked |
| P2-004 | done | Implement answer submission + SM-2 style updates + mastery tiers | P2-001 | L | review intervals, streaks, mastery update correctly |
| P2-005 | done | Build due-review and weak-word modes | P2-004 | M | mode filters reflect progress state |
| P2-006 | done | Add quiz engine test suite (unit + integration) | P2-002,P2-004 | M | happy path + edge cases covered |

## Phase 3 - Product Flows (Text-First UX)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P3-001 | done | Dashboard cards for progress, weak words, streak, XP | P2-004 | M | stats render correctly from API |
| P3-002 | done | Home flow: Continue, Daily Review, Cluster Practice, Weak Words | P2-005 | M | all entry points route to correct mode |
| P3-003 | done | Quiz feedback UX: correctness, answer explanation, confidence input | P2-004 | M | user can finish full session smoothly |
| P3-004 | done | Session summary screen and next recommended action | P3-003 | S | summary shows accuracy + next step |
| P3-005 | done | Basic gamification (XP, streak, cluster completion badge) | P3-001 | M | counters update correctly after sessions |
| P3-006 | done | Accessibility + Telugu text readability pass | P3-003 | M | contrast, keyboard nav, font legibility validated |

## Phase 4 - Hardening + Release

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4-001 | done | Add API contract tests for all public quiz/stats routes | P2-006 | M | route contracts validated in CI |
| P4-002 | done | Add performance pass for quiz generation (<200ms target) | P2-003 | M | benchmark report meets target |
| P4-003 | done | Add logging and basic telemetry for quiz funnel | P3-004 | M | events visible for start/submit/finish |
| P4-004 | done | Add production runbook and incident playbook | P4-003 | S | docs cover deploy, rollback, common failures |
| P4-005 | doing | Beta readiness checklist and release gate sign-off | P4-001,P4-002,P4-004 | S | all release criteria satisfied |
| P4-006 | done | Add complex sentence workouts (text-only) | P3-004 | M | advanced text exercises run without media dependency |
| P4-007 | done | Add contextual learning mode (stories/dialogues text) | P4-006 | M | users can learn words inside short text contexts |
| P4-008 | done | Add reinforcement loops after each lesson | P3-003 | M | auto-review of weak/related words runs after session |
| P4-009 | done | Add optional AI tutor mode (text chat) behind feature flag | P4-007 | L | tutor uses known vocabulary and evaluates user responses |

## Phase 4B - Critical UX Fixes + Vocabulary Review Governance

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P4B-001 | done | Fix leaderboard pipeline (API query, aggregation window, UI rendering state) | P4-001 | M | leaderboard shows non-empty deterministic ranks for seeded/test users |
| P4B-002 | done | Fix profile page data loading and mutation flows | P4-001 | M | profile view/edit works and persists after reload |
| P4B-003 | done | Fix avatar/image handling (upload/save/display/fallback) | P4B-002 | M | avatar updates immediately and survives new sessions |
| P4B-004 | done | UI styling cleanup pass (spacing, responsive breakpoints, typography consistency) | P3-006 | M | key app screens pass visual QA checklist on mobile + desktop |
| P4B-005 | done | Add regression test suite for leaderboard/profile/avatar/styling critical paths | P4B-001,P4B-002,P4B-003,P4B-004 | M | failing tests reproduce old bugs and pass on fixes |
| P4B-006 | todo | Add vocabulary review schema (draft/pending/approved/rejected + reviewer metadata) | P1-001 | M | DB + API support review state transitions with audit fields |
| P4B-007 | todo | Build reviewer queue and reviewer role permissions | P4B-006 | M | only reviewers can approve/reject pending vocabulary items |
| P4B-008 | todo | Enforce approval gate in learning flows (exclude non-approved vocab from production sessions) | P4B-007 | M | learners only receive approved vocabulary by default |
| P4B-009 | todo | Add source evidence and change history on each vocab item | P4B-006 | M | reviewer can inspect source URL, extraction time, and edit history |
| P4B-010 | todo | Add reviewer productivity tooling (bulk approve/reject, comments, conflict re-open) | P4B-007 | M | reviewer can process queue efficiently with full traceability |
| P4B-011 | todo | Allow AI-assisted/manual vocabulary creation as DRAFT only | P4B-006 | S | generated entries never go live without reviewer approval |
| P4B-012 | done | Pronunciation-first learning UX (transliteration primary, Telugu script secondary in brackets) | P3-003 | M | quiz/cards/feedback consistently prioritize pronunciation text |

## Phase 5 - Media Expansion (Final)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | todo | Add optional audio URL support end-to-end (no blocking on missing media) | P4-005 | M | text flow unaffected when no audio |
| P5-002 | todo | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be toggled on/off |
| P5-003 | todo | Add image hints for selected vocabulary groups | P5-001 | M | images load lazily and degrade gracefully |
| P5-004 | todo | Add media moderation/storage policy + cost controls | P5-001 | S | policy and quotas documented and enforced |
| P5-005 | todo | Media QA and accessibility pass | P5-002,P5-003 | M | captions/alt text/fallback behavior validated |

## Global exit criteria

- Phase 2 complete before any media-heavy work.
- All Phase 4 and Phase 4B release gates complete before Phase 5 starts.
- Daily resume log maintained with task-level continuity.
