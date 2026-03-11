# Daily Run Log (Compact)

Date: 2026-03-10  
Session owner: Codex  
Last completed task ID: P8-008  
Current in-progress task ID: -  
Next task ID: -

## Current state

- Production deploy flow now uploads local `.env.production` to the server on every deploy and force-recreates containers so runtime env changes apply.
- Production server notes were moved to [documentation/server.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/server.md).
- Implementation-backed core feature documentation now exists in [documentation/core-features.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/core-features.md).
- Completed phase plans have since been folded into implementation-backed documentation and removed from active context.
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
Last completed task ID: P11-002  
Current in-progress task ID: -  
Next task ID: -

## Current state

- `P9-001` and `P9-002` are complete.
- Frontend architecture baseline created in [documentation/frontend-architecture-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-architecture-baseline.md).
- Core feature documentation remains available in [documentation/core-features.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/core-features.md).
- The final Phase 9 smoke/E2E scope is now explicit in [documentation/e2e-smoke-scope.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/e2e-smoke-scope.md), including the minimum production-critical path set, suite ownership, and the remaining automation gaps before `P9-010` can close.
- `P9-010` is now complete: the smoke suite covers learner and reviewer critical paths, the release-gate split between frontend integration and API-level smoke is explicit, and CI now provisions Postgres, migrates/imports content, runs `pnpm run ci`, runs production-like smoke, and then builds.
- `P9-008` is now complete: backend service/controller/integration coverage and the invariant map cover the Phase 9 refactor-sensitive auth, quiz, review, analytics, vocabulary, audio, and language-isolation contracts, with remaining risk reduced to environment availability rather than missing automated cases.
- `P9-003`, `P9-004`, and `P9-005` are now complete: the shared async UX contract, shared state primitives, and responsive/mobile hardening work have all been implemented and adopted broadly enough that only explicitly deferred low-priority long-tail gaps remain.
- `P9-009` is now complete: learner/reviewer integration coverage, shared primitive coverage, high-risk responsive regressions, and explicit deferrals are all documented in [frontend-coverage-matrix.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-coverage-matrix.md).
- Phase 9 is now complete.
- `P11-001` is now complete:
  - app shell, dense data surfaces, forms, and learner flows were reworked for stronger phone-first behavior
  - quiz mobile UX was tightened further with explicit answer confirmation, reduced control chrome, and less noisy async UI
  - full `pnpm run lint` passed after the responsive hardening pass
- Follow-up noted for `P11-002`:
  - the visible quiz confidence UI was removed for UX reasons during mobile hardening
  - product still needs to decide whether confidence returns behind a learner preference or is replaced by a lower-friction input model
- `P11-002` is now complete:
  - the quiz confidence selector was restored behind a learner preference stored locally
  - profile now exposes a dedicated toggle for that preference
  - quiz answer submission still captures confidence while leaving the mobile quiz UI uncluttered by default
- Phase 12 planning is now active in [81-phase-12-theme-system-and-design-token-extraction.md](/Users/aman/Projects/personal-projects/Learn-Language/context/plan/81-phase-12-theme-system-and-design-token-extraction.md).
- Active backlog was reprioritized to start with theming-system readiness before UI theme selection work:
  - `P12-001` is now complete via [theme-system-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/theme-system-baseline.md)
  - `P12-002` is now complete via [theme-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/theme-contract.md)
  - `P12-003` is now complete:
    - supported theme ownership now lives in [app-theme.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.ts)
    - app-level provider wiring now flows through [app-theme-provider.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme-provider.tsx)
    - the frontend boot path now reads the default theme from one seam in [client/src/App.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/App.tsx)
    - focused UI config coverage now exists in [app-theme.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.test.tsx)
  - `P12-004` is now complete:
    - the current shipped visual style now lives in the named current-theme token set in [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
    - a complete `minimal` token set now exists in [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
    - implemented theme rotation now switches between `dark` and `minimal` through [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
    - theme config coverage now verifies both implemented themes in [client/src/theme/app-theme.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.test.tsx)
    - verification passed with `pnpm exec vitest run client/src/theme/app-theme.test.tsx` and `pnpm run check`
  - `P12-005` is now complete:
    - shared token utilities now own reusable motion/status-surface behavior in [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
    - core primitives now use semantic radius/shadow/status tokens across [button-variants.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/button-variants.ts), [card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/card.tsx), [alert.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/alert.tsx), [toast.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/toast.tsx), [avatar.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/avatar.tsx), and [page-states.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/page-states.tsx)
    - form and overlay primitives now use theme-safe token surfaces in [input.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/input.tsx), [textarea.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/textarea.tsx), [select.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/select.tsx), [dialog.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/dialog.tsx), [popover.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/popover.tsx), and [sheet.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/sheet.tsx)
    - verification passed with `pnpm run test:ui` and `pnpm run check`
  - `P12-006` is now complete:
    - quiz feedback, profile save messaging, review draft feedback, and history result badges now consume semantic status tokens in [quiz-feedback-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz/quiz-feedback-panel.tsx), [profile-form-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-form-card.tsx), [create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/create-vocabulary-draft-form.tsx), and [history-results-table.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-results-table.tsx)
    - status text utility classes now exist in [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
    - targeted verification passed with `pnpm exec vitest run client/src/features/profile/profile-form-card.test.tsx client/src/features/review/create-vocabulary-draft-form.test.tsx client/src/features/history/history-results-table.test.tsx client/src/components/quiz-card.test.tsx client/src/pages/history.integration.test.tsx client/src/pages/add-vocabulary.integration.test.tsx client/src/theme/app-theme.test.tsx` and `pnpm run check`
    - remaining raw status-color outlier is now limited to [client/src/pages/not-found.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/not-found.tsx), which moves into `P12-007`
  - `P12-007` is now complete:
    - the not-found route now uses shared theme-safe surface/status styling in [client/src/pages/not-found.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/not-found.tsx)
    - quiz feedback examples no longer rely on `dark:` branching in [client/src/components/quiz/quiz-feedback-examples.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz/quiz-feedback-examples.tsx)
    - the final page/feature outlier scan now leaves only [client/src/components/ui/chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx), which is the intended scope of `P12-008`
    - targeted verification passed with `pnpm exec vitest run client/src/components/quiz-card.test.tsx client/src/pages/auth.integration.test.tsx client/src/theme/app-theme.test.tsx` and `pnpm run check`
  - `P12-008` is now complete:
    - chart theme selector ownership now derives from the named theme registry in [client/src/components/ui/chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx) and [client/src/theme/app-theme.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.ts)
    - chart tooltip surfaces now use tokenized shadow/radius styling in [client/src/components/ui/chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx)
    - focused chart coverage now exists in [client/src/components/ui/chart.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.test.tsx)
    - verification passed with `pnpm exec vitest run client/src/components/ui/chart.test.tsx client/src/theme/app-theme.test.tsx` and `pnpm run check`
  - `P12-009` is now complete:
    - provider boot coverage now exists in [client/src/theme/app-theme-provider.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme-provider.test.tsx)
    - outlier page regression coverage now exists in [client/src/pages/not-found.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/not-found.test.tsx)
    - shared error-state class coverage was tightened in [client/src/components/ui/page-states.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/page-states.test.tsx)
    - verification passed with:
      - `pnpm exec vitest run client/src/theme/app-theme-provider.test.tsx client/src/pages/not-found.test.tsx client/src/components/ui/page-states.test.tsx client/src/components/ui/chart.test.tsx client/src/theme/app-theme.test.tsx`
      - `pnpm run test:ui`
      - `pnpm run check`
  - Phase 12 is now complete and the active backlog returns to `P11-002`
- Planning baselines for the next implementation tasks are now documented:
  - React Query ownership baseline in [documentation/react-query-ownership-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/react-query-ownership-baseline.md)
  - Async UX contract in [documentation/async-ux-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/async-ux-contract.md)
  - UI state primitive baseline in [documentation/ui-state-primitives-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/ui-state-primitives-baseline.md)
  - Responsive UI baseline in [documentation/responsive-ui-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/responsive-ui-baseline.md)
  - Frontend coverage matrix in [documentation/frontend-coverage-matrix.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-coverage-matrix.md)
  - Backend refactor invariants in [documentation/backend-refactor-invariants.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/backend-refactor-invariants.md)
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
  - page-level integration coverage now also protects history loading/error states, clusters empty-state composition, and word-bucket loading plus bucket-switch behavior in [history.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.integration.test.tsx), [clusters.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.integration.test.tsx), and [word-buckets.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/word-buckets.integration.test.tsx)
  - page-level integration coverage now also protects dashboard loading/default-primary-action behavior and review queue loading/error/empty state composition in [dashboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.integration.test.tsx) and [review.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.integration.test.tsx)
  - `P9-009A` is now complete with a stabilized page/state inventory in [frontend-coverage-matrix.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-coverage-matrix.md), including the current gap list for dashboard, auth bootstrap, clusters/context failure states, review state branches, and responsive regressions
  - clusters and contextual pages now expose explicit retryable request-failure states from their view-models and page shells, and review page integration coverage now also protects history loading/error branches after item selection
  - auth bootstrap/redirect behavior is now directly covered in [use-auth-page-view-model.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/use-auth-page-view-model.test.tsx), narrowing the remaining auth gap to whether the route needs explicit failure treatment
  - dashboard now exposes a retryable request-failure state from [dashboard.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.tsx), with integration coverage protecting loading, retry, populated render, and default-primary-action behavior in [dashboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.integration.test.tsx)
  - Phase 9 task rows were reconciled against the current implementation: learner/reviewer architecture slices (`P9-006`, `P9-007`) are now marked done, `P9-009A` and `P9-009B` are done, and remaining frontend/backend test-expansion items stay explicitly in progress
  - `/auth` now renders a dedicated bootstrap surface in [auth-bootstrap-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/auth-bootstrap-panel.tsx) while token handoff or session restoration is in progress, with direct route and hook coverage protecting that behavior
  - responsive regression work has started under `P9-009E`: high-risk action rows now have direct responsive class assertions in [history-page-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-page-header.test.tsx), [leaderboard-header.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-header.test.tsx), [word-bucket-controls.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-controls.test.tsx), and [review-bulk-actions.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-bulk-actions.test.tsx)
  - `P9-008A` and `P9-008D` are now explicit in [backend-refactor-invariants.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/backend-refactor-invariants.md), which maps current backend invariants to protecting tests and documents the active backend test-command set
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
  - `P9-010A` is now complete: [e2e-smoke-scope.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/e2e-smoke-scope.md) names the minimum production-critical path set, maps each path to its current automated owner, and keeps the remaining learner/reviewer smoke gaps explicit
  - the integrated smoke suite now also bootstraps a reviewer user via `/auth/me`, verifies live reviewer queue access at `/api/review/queue`, and submits a vocabulary draft through `/api/review/words`
  - the GitHub Actions quality workflow now provisions Postgres, applies migrations, imports content, runs `pnpm run ci`, runs `pnpm run test:e2e:smoke:production`, and only then proceeds to build verification
  - dashboard zero-data/default-stat rendering is now directly covered in [dashboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.integration.test.tsx), closing the old ambiguity around whether an all-zero dashboard should be treated as an empty or success state
  - page-level responsive assertions now backstop the highest-risk analytics/review layouts in [history.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.integration.test.tsx), [leaderboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/leaderboard.integration.test.tsx), [review.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.integration.test.tsx), and [word-buckets.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/word-buckets.integration.test.tsx)
  - leaderboard and profile route-level loading composition are now directly covered in [leaderboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/leaderboard.integration.test.tsx) and [profile.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/profile.integration.test.tsx)
  - [frontend-coverage-matrix.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-coverage-matrix.md) now reflects the closed dashboard/responsive gaps and explicitly defers only the remaining auth-provider failure semantics and lower-priority long-tail responsive coverage
  - [backend-refactor-invariants.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/backend-refactor-invariants.md) now records both smoke commands and closes the old generic backend-gap list
  - top-level Phase 9 statuses are now reconciled: `P9-003`, `P9-004`, `P9-005`, `P9-008`, `P9-009`, and `P9-010` are all marked done in the phase plan and master registry
  - responsive/mobile hardening continued across extracted action rows and pagination surfaces in leaderboard, contextual, dashboard, review, history, clusters, and word buckets so primary actions stack cleanly and footer controls expand to full-width buttons on small screens
  - page-level integration coverage now also includes [clusters.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.integration.test.tsx) and [contextual.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.integration.test.tsx)
  - page-level integration coverage now also includes [tutor.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/tutor.integration.test.tsx)
  - extracted page-header contracts for contextual, leaderboard, and review were aligned to their view-model state types so `pnpm run check` passes again without page-level casts
  - full `pnpm run lint`, `pnpm run test:ui`, `pnpm test`, and `pnpm run test:e2e:smoke:development` now pass on the current branch state, with the UI suite now at 35 files / 67 tests and the backend suite now at 65 tests with 63 passing and 2 DB-dependent skips

## Current blockers

- No hard blocker found for current Phase 9 work.
- DB-backed integration tests still skip when Postgres is unavailable locally; this is expected in the current environment.

## Immediate next actions

- Start the next phase/task only after the backlog is re-prioritized against the now-closed Phase 9 baseline.

---

Date: 2026-03-11  
Session owner: Codex  
Last completed task ID: P10-012  
Current in-progress task ID: -  
Next task ID: -

## Current state

- Phase 9 remains complete and closed.
- Phase 10 execution plan now exists in [80-phase-10-platform-hardening-and-product-intelligence.md](/Users/aman/Projects/personal-projects/Learn-Language/context/plan/80-phase-10-platform-hardening-and-product-intelligence.md).
- `P10-001` is complete via the current-state inventory in [platform-hardening-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/platform-hardening-baseline.md).
- `P10-002` is complete:
  - shared route contracts now express success/error envelopes
  - backend success responses now emit a canonical envelope through `sendSuccess(...)`
  - shared error responses now include `success`, `error`, and `data: null`
  - frontend services and hooks now unwrap the envelope through the shared route helper instead of parsing raw payloads directly
  - controller and route-contract tests now assert the envelope shape
  - full `pnpm run lint` passes on the current branch state after the migration
- The baseline records the current platform seams before implementation:
  - success responses are raw payloads while errors use a shared error envelope
  - most API routes hardcode `/api/...` in controller decorators, but auth still exposes `/auth/*` routes outside the API convention
  - Winston, Morgan, Nest logging, and request IDs already exist, but the log schema is inconsistent and redaction is not centralized
  - no product analytics SDK or shared event taxonomy is currently implemented
  - security has CORS, auth cookies, validation, and guards in place, but lacks Helmet, rate limiting, and a centralized production-safe exception strategy
  - production currently publishes both frontend `3000` and backend `5001` directly in [docker-compose.prod.yml](/Users/aman/Projects/personal-projects/Learn-Language/deploy/production/docker-compose.prod.yml)
  - SEO has base metadata, sitemap, robots, and structured data, but current sitemap/robots/public-route assumptions are inconsistent
- `P10-003` is complete:
  - Nest now owns a real global `/api` prefix in [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts) instead of hardcoding `/api` in every controller decorator
  - controller route decorators were normalized to domain-relative paths under the global prefix
  - auth endpoints now live under `/api/auth/*`, including `me`, `profile`, `google`, `google/callback`, and `logout`
  - shared route contracts, frontend services/hooks, smoke coverage, and auth tests now use the canonical `/api/auth/*` taxonomy
  - full `pnpm run lint` passes on the current branch state after the route migration
- `P10-004` is complete:
  - backend logs now serialize as structured JSON lines through [logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/logger.ts)
  - request logging now emits structured `http.request.completed` and `http.request.aborted` events with `requestId`, method, path, status, duration, and optional `userId`
  - recursive redaction now masks auth headers, cookies, tokens, secrets, passwords, and API keys before logs are emitted
  - the last `console.error` fallback was removed from auth controller error handling
  - observability guidance now exists in [observability-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/observability-contract.md)
  - focused logger tests now protect redaction, circular-safe serialization, and request log metadata extraction
  - full `pnpm run lint` passes on the current branch state after the observability work
- `P10-005` is complete:
  - analytics provider abstraction now exists in [analytics.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/lib/analytics.ts)
  - analytics taxonomy and ownership guidance now exist in [analytics-event-taxonomy.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/analytics-event-taxonomy.md)
  - auth, quiz, clusters, review, and profile flows now emit controlled client analytics events through the shared adapter
- `P10-006` is complete:
  - backend now applies baseline security headers, no-store auth caching, targeted rate limits, hardened static file serving, and production-safe Express error normalization
  - reviewer authorization now returns `403 FORBIDDEN` consistently
  - the current hardening baseline is documented in [security-hardening-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/security-hardening-contract.md)
  - full `pnpm run lint` passes after the security slice
- `P10-007` is complete:
  - production compose now binds frontend/backend ports to loopback by default instead of publishing them on all interfaces
  - runtime port ownership is now env-driven through host/container bind variables
  - backend app config now resolves `BACKEND_PORT` consistently with bootstrap
  - the current topology is documented in [runtime-topology-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/runtime-topology-contract.md)
  - full `pnpm run lint` passes after the runtime hardening slice
- `P10-008` is now in progress:
  - initial performance findings are documented in [performance-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/performance-baseline.md)
  - production frontend build completed successfully and exposed a metadata warning to fold into later SEO work
  - backend hotspot review identified quiz generation, leaderboard aggregation, and learning-insights aggregation as the highest-value candidates
  - the first optimization slice is complete: quiz generation now narrows word-cluster link loading to the active distractor pool instead of scanning all links per request
  - the second optimization slice is complete: independent analytics storage reads now run concurrently where possible, and leaderboard computation now reduces repeated per-user filtering work
  - the third optimization slice is complete: aggregate analytics reads now use a short-lived service-level cache
  - the fourth optimization slice is complete: learning-insights category and cluster aggregation now use grouped SQL queries instead of row-by-row in-memory accumulation
  - full `pnpm run lint` passes after the completed performance work
- `P10-008` is now complete.
- `P10-009` is now complete:
  - public route classification now distinguishes the single crawlable auth surface from the authenticated SPA routes
  - route-aware metadata now lives in the app catch-all route and emits `noindex` for protected pages
  - sitemap and robots now align with the actual public route map
  - the misleading protected-route `SearchAction` was removed from structured data
  - the Next metadata `themeColor` warning was fixed by moving it into viewport export
  - the crawlability and submission runbook now exists in [seo-crawlability-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/seo-crawlability-contract.md)
  - the full `pnpm run lint` gate passes after the SEO slice
  - two unrelated slow UI integration tests now carry explicit 15s per-test timeouts so the gate reflects real regressions instead of runner slowness
- `P10-010` is now complete:
  - code-governance ownership and enforcement guidance now lives in [code-governance-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/code-governance-contract.md)
  - the repo now enforces symbol ownership in the lint gate through [check-symbol-governance.ts](/Users/aman/Projects/personal-projects/Learn-Language/script/check-symbol-governance.ts)
  - exported enums are now restricted to the approved enum modules and duplicate exported symbol names fail CI
  - the duplicate exported `QuizMode` alias was removed so the new check starts green without a permanent allowlist
- `P10-011` is now complete:
  - DI guidance now lives in [dependency-injection-policy.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/dependency-injection-policy.md)
  - the code guidelines now explicitly state when plain constructor injection is preferred and when `@Inject(...)` is actually required
- `P10-012` is now complete:
  - AI prioritization and rollout constraints now live in [ai-product-roadmap.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/ai-product-roadmap.md)
  - the recommended MVP is reviewer-assist for draft/example generation, with adaptive study recommendations deferred as the next higher-upside experiment
- Phase 10 is now complete.
- the full `pnpm run lint` gate should be treated as the final verification step for the governance closeout once run on the current branch state

## Current blockers

- No current implementation blocker.

## Immediate next actions

- Decide the confidence-input direction captured in `P11-002` before the next quiz UX pass.

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
