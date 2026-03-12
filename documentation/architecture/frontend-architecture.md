# Frontend Architecture

This document describes the current frontend architecture contributors should preserve when adding new UI work.

## Topology

The frontend runs as:

- public app-router pages in `app/*` for crawlable marketing and SEO entry points
- a client-side SPA mounted through [app/[...slug]/page.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/[...slug]/page.tsx) and [client/src/next-spa-root.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/next-spa-root.tsx)
- SPA routing and authenticated product surfaces in [client/src/App.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/App.tsx)

The main layers inside the SPA are:

- route pages in `client/src/pages`
- feature view-models and feature components in `client/src/features/*`
- shared query/data hooks in `client/src/hooks`
- transport adapters in `client/src/services`
- reusable UI/state primitives in `client/src/components` and `client/src/components/ui`
- shared theme ownership in `client/src/theme/*`

## Current route ownership

Public app-router routes currently own:

- `/`
- `/features`
- `/how-it-works`
- `/languages/telugu`
- `/topics`

The SPA owns:

- `/auth`
- `/dashboard`
- `/quiz`
- `/clusters`
- `/leaderboard`
- `/profile`
- `/history`
- `/analytics`
- `/analytics/words`
- `/review`
- `/review/add`
- `/contextual`
- `/tutor`

Protected route gating remains in [client/src/App.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/App.tsx) through `useAuth()`.

## Feature-layer structure

The intended pattern is now established across the core product surfaces: pages stay thin, feature hooks own orchestration, and presentational feature components render the resulting state.

Current feature view-model owners include:

- [client/src/features/auth/use-auth-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/use-auth-page-view-model.ts)
- [client/src/features/dashboard/use-dashboard-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/dashboard/use-dashboard-view-model.ts)
- [client/src/features/quiz/use-quiz-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/use-quiz-page-view-model.ts)
- [client/src/features/clusters/use-clusters-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/use-clusters-page-view-model.ts)
- [client/src/features/contextual/use-contextual-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/contextual/use-contextual-page-view-model.ts)
- [client/src/features/history/use-history-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/use-history-page-view-model.ts)
- [client/src/features/analytics/use-leaderboard-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/use-leaderboard-page-view-model.ts)
- [client/src/features/analytics/use-word-buckets-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/use-word-buckets-view-model.ts)
- [client/src/features/profile/use-profile-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/use-profile-page-view-model.ts)
- [client/src/features/review/use-review-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/use-review-page-view-model.ts)
- [client/src/features/review/use-create-vocabulary-draft-form.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/use-create-vocabulary-draft-form.ts)
- [client/src/features/tutor/use-tutor-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/tutor/use-tutor-page-view-model.ts)

## Data-access structure

React Query owns transport-backed request lifecycle.

Current ownership rules are documented in:

- [frontend-ui-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/frontend-ui-contract.md)

Current layering:

- `client/src/services/*` wraps API transport
- `client/src/hooks/*` owns shared queries, mutations, keys, and invalidation behavior
- `client/src/features/*/use-*-view-model.ts` owns route-level state composition
- pages and presentational components consume those abstractions rather than calling `apiClient` directly

## Shell ownership

[client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx) remains the main authenticated shell and owns:

- navigation
- mobile drawer/collapsed sidebar state
- theme switching across implemented themes
- language switching
- user avatar/menu affordances

That is still a dense component, but it is now aligned with the intended architecture boundary: shell concerns live there, while feature-specific async/data orchestration lives outside it.

## Testing coverage

Architecture-sensitive surfaces are protected by:

- page integration tests under `client/src/pages/*.integration.test.tsx`
- feature/component tests under `client/src/features/**/*.test.tsx` and `client/src/components/**/*.test.tsx`
- backend/controller tests for API contracts
- smoke coverage in [e2e/smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts)

## Rules contributors should preserve

- Keep transport-backed `useQuery` and `useMutation` ownership out of pages and presentational components.
- Add page orchestration in feature view-models before expanding page components.
- Reuse shared UI/state primitives instead of hand-rolling loading, error, pending, and empty states.
- Preserve the split between crawlable public app-router pages and authenticated SPA routes.
- Keep theme-aware behavior in shared tokens, variants, and theme helpers rather than route-local styling logic.
