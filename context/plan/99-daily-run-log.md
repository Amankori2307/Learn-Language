# Daily Run Log (Compact)

Date: 2026-03-10  
Session owner: Codex  
Last completed task ID: P8-008  
Current in-progress task ID: -  
Next task ID: P9-001

## Current state

- Production deploy flow now uploads local `.env.production` to the server on every deploy and force-recreates containers so runtime env changes apply.
- Production server notes were moved to [documentation/server.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/server.md).
- Implementation-backed core feature documentation now exists in [documentation/core-features.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/core-features.md).
- A new detailed Phase 9 execution plan now exists in [context/plan/70-phase-9-frontend-architecture-and-quality.md](/Users/aman/Projects/personal-projects/Learn-Language/context/plan/70-phase-9-frontend-architecture-and-quality.md).
- Phase 9 is ordered to avoid wasted work:
  - architecture boundary first
  - React Query and async UX standardization second
  - shared loading/skeleton states third
  - responsive/mobile hardening fourth
  - comprehensive backend/frontend/E2E/smoke coverage after refactor surfaces stabilize

## Current blockers

- No implementation blocker identified for planning.
- `P7-004` remains historically blocked by network/package constraints for Next.js migration, but it is not the current execution track.

## Immediate next actions

- Start `P9-001` and create the frontend architecture baseline with a concrete page/feature/service/presentational boundary inventory.

---

Date: 2026-03-11  
Session owner: Codex  
Last completed task ID: P9-010  
Current in-progress task ID: P9-006  
Next task ID: P9-007

## Current state

- `P9-001` and `P9-002` are complete.
- Frontend architecture baseline created in [documentation/frontend-architecture-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-architecture-baseline.md).
- Core feature documentation remains available in [documentation/core-features.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/core-features.md).
- Planning baselines for the next implementation tasks are now documented:
  - React Query ownership baseline in [documentation/react-query-ownership-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/react-query-ownership-baseline.md)
  - Async UX contract in [documentation/async-ux-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/async-ux-contract.md)
  - UI state primitive baseline in [documentation/ui-state-primitives-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/ui-state-primitives-baseline.md)
  - Responsive UI baseline in [documentation/responsive-ui-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/responsive-ui-baseline.md)
- Active implementation order is now moving through async UX, responsive hardening, and surface extraction:
  - `P9-003` is in progress with shared async visibility implemented and adopted on main mutation paths
  - `P9-004` is in progress with shared state primitives introduced and adopted on high-traffic pages
  - `P9-005` is in progress with shell/mobile hardening started on layout, auth, review, quiz, and word buckets
  - `P9-006` / `P9-007` are in progress with learner/reviewer presentation extracted from several page shells
- `P9-002` implementation completed with these slices:
  - add-vocabulary cluster query moved out of [create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/create-vocabulary-draft-form.tsx) into [use-create-vocabulary-draft-form.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/use-create-vocabulary-draft-form.ts)
  - cluster query loading/error is now visibly surfaced in the add-vocabulary form
  - audio resolve transport moved out of [use-hybrid-audio.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-hybrid-audio.ts) into [audioService.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/services/audioService.ts)
  - high-traffic query key cleanup started in [use-quiz.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-quiz.ts) and [use-words.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-words.ts)
  - cluster page orchestration moved into [use-clusters-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/use-clusters-page-view-model.ts)
  - history page orchestration moved into [use-history-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/use-history-page-view-model.ts)
  - review page orchestration moved into [use-review-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/use-review-page-view-model.ts)
  - remaining page-level request ownership was removed from `leaderboard`, `profile`, `word-buckets`, `clusters`, and `contextual`
- `P9-003` / `P9-004` code work now includes:
  - global async request visibility in [app-async-indicator.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/app-async-indicator.tsx)
  - reusable pending action control in [pending-button.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/pending-button.tsx)
  - shared loading/error/empty state primitives in [page-states.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/page-states.tsx)
  - adoption of those primitives on dashboard, clusters, contextual, history, profile, review, word buckets, and leaderboard
- Additional implementation completed after the initial rollout:
  - analytics display extracted into [leaderboard-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-panel.tsx) and [word-bucket-word-list.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-word-list.tsx)
  - quiz terminal/loading states extracted into [quiz-page-states.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/quiz-page-states.tsx)
  - draft example rendering extracted into [vocabulary-draft-examples.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/vocabulary-draft-examples.tsx)
  - new frontend tests added for pending button, page states, leaderboard, and word buckets
  - direct component tests now cover extracted presentation surfaces in [dashboard-overview.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/dashboard/dashboard-overview.test.tsx), [profile-form-card.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-form-card.test.tsx), [auth-sign-in-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/auth-sign-in-panel.test.tsx), [review-queue-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-queue-panel.test.tsx), and [history-results-table.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-results-table.test.tsx)
  - second-slice direct component tests now cover [review-history-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-history-panel.test.tsx), [clusters-results-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-results-panel.test.tsx), [contextual-story-grid.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/contextual/contextual-story-grid.test.tsx), [quiz-page-states.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/quiz-page-states.test.tsx), and [vocabulary-draft-examples.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/vocabulary-draft-examples.test.tsx)
  - add-vocabulary form presentation now lives in [create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/create-vocabulary-draft-form.tsx) under the review feature layer, with the legacy components path reduced to a compatibility re-export
  - add-vocabulary route heading now lives in [add-vocabulary-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/add-vocabulary-page-header.tsx) so the route shell only composes reviewer access, heading, and draft form surfaces
  - auth route branding now lives in [auth-brand-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/auth-brand-panel.tsx) so the auth page shell only composes auth-specific presentation and login orchestration
  - history route header and refresh CTA now live in [history-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-page-header.tsx) so the analytics page shell only composes history presentation slices
  - profile route heading now lives in [profile-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-page-header.tsx) so the profile page shell only composes loading, error, and form surfaces
  - tutor route heading now lives in [tutor-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/tutor/tutor-page-header.tsx) so the tutor page shell only composes tutor presentation and chat interaction surfaces
  - word-bucket improvement guidance and bucket-switch controls now live in [word-bucket-controls.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-controls.tsx) so the page shell only composes analytics presentation sections
  - active quiz-session chrome now lives in [quiz-session-shell.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/quiz-session-shell.tsx) so the quiz route focuses on state branching while session layout and progress presentation stay in the quiz feature layer
  - remaining page shells were thinned further by extracting [history-summary-cards.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-summary-cards.tsx), [history-filter-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-filter-panel.tsx), [word-bucket-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-header.tsx), and [tutor-chat-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/tutor/tutor-chat-panel.tsx)
  - direct tests now also cover [history-filter-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-filter-panel.test.tsx), [history-page-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-page-header.test.tsx), [word-bucket-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-header.test.tsx), [word-bucket-controls.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-controls.test.tsx), [quiz-session-shell.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/quiz-session-shell.test.tsx), [tutor-chat-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/tutor/tutor-chat-panel.test.tsx), [tutor-page-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/tutor/tutor-page-header.test.tsx), [create-vocabulary-draft-form.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/create-vocabulary-draft-form.test.tsx), [add-vocabulary-page-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/add-vocabulary-page-header.test.tsx), [auth-brand-panel.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/auth-brand-panel.test.tsx), and [profile-page-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-page-header.test.tsx)
  - page-level integration coverage now also protects auth pending composition and profile retryable error handling in [auth.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/auth.integration.test.tsx) and [profile.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/profile.integration.test.tsx)
  - page-level integration coverage now also protects leaderboard retryable errors and contextual loading-state rendering in [leaderboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/leaderboard.integration.test.tsx) and [contextual.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.integration.test.tsx)
  - review page presentation was further split into [review-access-state.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-access-state.tsx), [review-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-page-header.tsx), and [review-bulk-actions.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-bulk-actions.tsx)
  - direct tests now cover [review-access-state.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-access-state.test.tsx), [review-page-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-page-header.test.tsx), and [review-bulk-actions.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-bulk-actions.test.tsx)
  - leaderboard, contextual, clusters, and profile shells were thinned further via [leaderboard-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-header.tsx), [contextual-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/contextual/contextual-header.tsx), [clusters-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-header.tsx), [clusters-filter-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-filter-panel.tsx), and [profile-loading-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-loading-card.tsx)
  - direct tests now also cover [leaderboard-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-header.test.tsx), [contextual-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/contextual/contextual-header.test.tsx), [clusters-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-header.test.tsx), and [profile-loading-card.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-loading-card.test.tsx)
  - responsive/mobile hardening continued across extracted action rows and pagination surfaces in leaderboard, contextual, dashboard, review, history, clusters, and word buckets so primary actions stack cleanly and footer controls expand to full-width buttons on small screens
  - backend test coverage expanded for auth/profile controller behavior and audio language mismatch handling
  - backend auth-service coverage now exists in [auth.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.service.test.ts) for role resolution on upsert, claims-backed fallback when storage fails, profile backfill on existing users, and invalid profile payload mapping
  - backend review-service coverage now exists in [review.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.service.test.ts) for queue normalization, bulk transition counts, validation-error mapping, and invalid conflict identifiers
  - backend analytics-service coverage now exists in [analytics.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.service.test.ts) for history normalization, leaderboard defaults, and bucket input forwarding
  - backend analytics-controller coverage now exists in [analytics.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.controller.test.ts) for learning-insights forwarding and attempt-history error mapping
  - backend review-controller coverage now exists in [review.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.test.ts) for reviewer-id forwarding, history error mapping, and draft submission forwarding
  - backend quiz-controller coverage now exists in [quiz.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.controller.test.ts) for generate forwarding, submit forwarding, and AppError mapping
  - backend quiz-service coverage now exists in [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) for seed fallback, selected-language enforcement, and progress/attempt persistence on answer submission
  - backend vocabulary-controller coverage now exists in [vocabulary.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.controller.test.ts) for cluster-list forwarding and cluster-detail not-found mapping
  - backend vocabulary-service coverage now exists in [vocabulary.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.service.test.ts) for cluster language forwarding and not-found behavior on word/cluster lookups
  - smoke coverage expanded to include auth, profile, stats, learning insights, attempt history, leaderboard, word buckets, cluster list, cluster detail, quiz generation, and quiz submission critical paths
  - responsive/mobile hardening continued across extracted action rows and pagination surfaces in leaderboard, contextual, dashboard, review, history, clusters, and word buckets so primary actions stack cleanly and footer controls expand to full-width buttons on small screens
  - page-level integration coverage now also includes [clusters.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.integration.test.tsx) and [contextual.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.integration.test.tsx)
  - page-level integration coverage now also includes [tutor.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/tutor.integration.test.tsx)
  - extracted page-header contracts for contextual, leaderboard, and review were aligned to their view-model state types so `pnpm run check` passes again without page-level casts
  - full `pnpm run lint`, `pnpm run test:ui`, `pnpm test`, and `pnpm run test:e2e:smoke:development` now pass on the current branch state, with the UI suite now at 35 files / 67 tests and the backend suite now at 65 tests with 63 passing and 2 DB-dependent skips

## Current blockers

- No hard blocker found for current Phase 9 work.
- DB-backed integration tests still skip when Postgres is unavailable locally; this is expected in the current environment.

## Immediate next actions

- Continue `P9-006` / `P9-007`:
  - extract remaining bulky learner/reviewer rendering into replaceable presentation components
  - continue mobile/responsive cleanup on the remaining long-tail pages
  - deepen `P9-009` around the remaining extracted surfaces and responsive-state assertions
  - only mark the remaining Phase 9 tasks `done` once the full surface area has been migrated, not just the highest-traffic paths

---

Date: 2026-02-21  
Session owner: Codex  
Last completed task ID: P7-003  
Current in-progress task ID: P7-004  
Next task ID: -

## Current state

- Phase 4 is complete and closed.
- Audio/visual answer feedback effects are implemented (`P5-006`).
- Single command quality gate exists: `pnpm run lint`.
- Future roadmap approved and converted into executable Phase 6 backlog.
- Language-isolation endpoint matrix created with per-endpoint scoped behavior + test ownership.
- Cross-language leakage integration coverage added and running in default lint pipeline.
- Storage query audit completed and submit-answer path now enforces selected language boundary.
- Leaderboard language-window behavior validated with integration assertions (`daily`, `weekly`, `all_time`).
- Content validator now enforces transliteration-collision, pronunciation-quality, and tag/cluster consistency gates.
- Environment parity gate is complete: CI now uses pnpm workflow with legacy schema prep + migration parity, and DB integration tests skip only when DB is unavailable locally.
- Review governance v2 schema is now active across DB + API with reviewer confidence score, secondary-review flag, and disagreement status fields.
- Conflict queue + resolution workflow is active with reviewer-only endpoints and integration coverage validating disagreement -> resolved audit trace.
- SRS config versioning is live with `srs_configs`, version-stamped progress updates, and fallback-safe default config resolution.
- Per-direction memory strengths are now persisted and used for scheduling priority + stats (`source->target` vs `target->source`).
- SRS drift monitoring is active with alert-friendly summary endpoint (`/api/admin/srs/drift`).
- Phase 6 core hardening (`P6-001` to `P6-011`) is complete.
- Context hygiene pass is complete: active context is now minimized in `context/plan`, and completed phase docs are archived under `context/archive`.
- Reviewer/admin create-vocabulary flow is now live in UI + API, with required pronunciation/meaning/examples and automatic insertion into draft review lifecycle.
- Optional audio URL support is now available in reviewer/admin vocabulary creation flow and persisted on words without affecting text-first flows.
- Optional `listen_identify` mode is now supported end-to-end for audio-enabled words.
- Optional image hints are now supported end-to-end (`imageUrl` on words + quiz payload + UI rendering fallback-safe).

## Current blockers

- `P7-004` backend Next.js migration is blocked by package installation constraints in the current environment:
  - `pnpm add next@15.2.0` fails with `ERR_PNPM_META_FETCH_FAIL` (`getaddrinfo ENOTFOUND registry.npmjs.org`)
  - without Next.js packages, runtime migration cannot be completed safely

## Immediate next actions

- `P7-004` is now the active long-running item; blocked in this environment due package installation/network constraints required for Next.js runtime migration.
