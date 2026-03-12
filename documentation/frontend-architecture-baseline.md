# Frontend Architecture Baseline

This document is the execution baseline for `P9-001`. It describes the current frontend structure, the main boundary leaks in the implementation, the target layering contract, and the migration buckets that Phase 9 will follow.

## Objective

Create a stable architectural baseline before refactoring UI, async UX, responsiveness, and tests.

This baseline exists to prevent:

- mixing business logic and rendering during page rewrites
- duplicating async/loading logic across pages
- locking tests around unstable page structures
- tying product logic to the current UI component library

## Current frontend topology

The current frontend is organized into these broad layers:

- route pages in `client/src/pages`
- feature view-models in `client/src/features/*`
- shared hooks in `client/src/hooks`
- service adapters in `client/src/services`
- presentational and semi-presentational components in `client/src/components`
- low-level UI primitives in `client/src/components/ui`

Current high-level observation:

- the repo already moved part of the way toward UI/logic separation
- the separation is inconsistent
- several pages still own significant view-state shaping
- a few components still perform request orchestration directly
- layout owns too many shell concerns in one component

## Current route inventory

### Learner routes

| Route | File | Current responsibility | Current architecture assessment |
| ----- | ---- | ---------------------- | ------------------------------- |
| `/dashboard` | `client/src/pages/dashboard.tsx` | renders learner dashboard from feature view-model output | good baseline; page is thin |
| `/quiz` | `client/src/pages/quiz.tsx` | renders session states and delegates orchestration to a feature view-model | mostly healthy; flow is large but structured |
| `/clusters` | `client/src/pages/clusters.tsx` | cluster listing plus query-param sync, filtering, sorting, paging, and local derived analytics | page owns too much data shaping and URL-state orchestration |
| `/contextual` | `client/src/pages/contextual.tsx` | cluster selection and context-line generation | page owns transformation logic that should live in feature layer |
| `/analytics` | `client/src/pages/history.tsx` | attempt analytics, filters, sorting, pagination, refresh | page owns significant view-state/data-shaping logic |
| `/analytics/words` | `client/src/pages/word-buckets.tsx` | bucket drill-down, CTA routing, pagination | mostly healthy; backed by feature view-model |
| `/leaderboard` | `client/src/pages/leaderboard.tsx` | leaderboard window selection and rendering | acceptable, but page still owns more presentation-state than ideal |
| `/profile` | `client/src/pages/profile.tsx` | profile query binding, local editable form state, save handling | mixed; mutation flow is fine but page still owns form workflow directly |
| `/auth` | `client/src/pages/auth.tsx` | token bootstrap, redirect handling, login redirect | page owns browser bootstrap side effects directly |
| `/tutor` | `client/src/pages/tutor.tsx` | local tutor feedback loop built from learned words | page contains non-trivial product logic and should either move to feature layer or be explicitly treated as non-core |

Public app-router entry surface:

| Route | File | Current responsibility | Current architecture assessment |
| ----- | ---- | ---------------------- | ------------------------------- |
| `/` | `app/page.tsx` | public marketing and SEO landing page that funnels visitors into auth or the signed-in dashboard | intentionally separate from the SPA so search engines can index a real home page |

### Reviewer/admin routes

| Route | File | Current responsibility | Current architecture assessment |
| ----- | ---- | ---------------------- | ------------------------------- |
| `/review` | `client/src/pages/review.tsx` | queue loading, selection model, notes state, bulk/single transitions, history panel orchestration | page is too orchestration-heavy |
| `/review/add` | `client/src/pages/add-vocabulary.tsx` | role gate and entry wrapper for draft form | healthy wrapper page |

### Infrastructure route

| Route | File | Current responsibility | Current architecture assessment |
| ----- | ---- | ---------------------- | ------------------------------- |
| fallback | `client/src/pages/not-found.tsx` | not-found rendering | presentational |

## Feature-layer inventory

Current feature-specific view-model modules:

- `client/src/features/dashboard/use-dashboard-view-model.ts`
- `client/src/features/quiz/use-quiz-page-view-model.ts`
- `client/src/features/analytics/use-word-buckets-view-model.ts`

Assessment:

- dashboard and quiz are the strongest examples of the intended pattern
- word buckets also follows the direction well
- several other pages still have not been migrated into the same feature-container/view-model pattern

Missing or underdeveloped feature modules:

- clusters
- contextual learning
- attempt history / analytics
- leaderboard
- profile form workflow
- review queue workflow
- review history/details
- add-vocabulary form workflow
- auth bootstrap workflow

## Hook and service inventory

### Shared hooks that already align reasonably well

- `use-auth`
- `use-quiz`
- `use-clusters`
- `use-attempt-history`
- `use-word-bucket`
- `use-profile`
- `use-review`
- `use-leaderboard`
- `use-words`

These are mostly React Query-backed and already act as data access boundaries.

### Service adapters

- `apiClient.ts`
- `authService.ts`
- `reviewService.ts`
- `userService.ts`

Assessment:

- Axios is already confined mostly to service and hook boundaries
- however, the transport boundary is not fully consistent because some components bypass service adapters and call `apiClient` directly

Known boundary leaks:

- [client/src/components/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/create-vocabulary-draft-form.tsx) performs its own cluster query with `useQuery` + `apiClient`
- [client/src/hooks/use-hybrid-audio.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-hybrid-audio.ts) mixes browser playback orchestration with API resolution logic

## Component-layer assessment

### Healthy presentational or mostly presentational pieces

- `stat-card`
- many `components/ui/*` primitives
- large parts of `quiz-card`

### Components currently carrying extra orchestration

- `layout.tsx`
  - navigation shell
  - mobile sheet state
  - desktop collapse state
  - profile dialog
  - theme toggle
  - language selection
  - auth-aware user menu
- `quiz-card.tsx`
  - still owns audio/effects orchestration via hooks
  - more than a pure presentational component
- `review/create-vocabulary-draft-form.tsx`
  - owns large form state
  - owns one-off data fetching for clusters
  - owns mutation success/error messages

## Current boundary violations

### 1. Pages with too much local view/data orchestration

Primary examples:

- [client/src/pages/clusters.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.tsx)
  - URL query parsing
  - search/filter/sort/pagination state
  - filtered dataset derivation
  - summary calculations
- [client/src/pages/history.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.tsx)
  - filter state
  - sorting logic
  - pagination logic
  - summary metrics derivation
- [client/src/pages/review.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.tsx)
  - queue orchestration
  - selection state model
  - mutation dispatch
  - history panel coordination
- [client/src/pages/contextual.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.tsx)
  - content transformation logic for story/context lines
- [client/src/pages/tutor.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/tutor.tsx)
  - embedded domain feedback logic

### 2. Components with data-fetch or domain-side effects

Primary examples:

- [client/src/components/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/create-vocabulary-draft-form.tsx)
  - local query definition for clusters
  - form workflow + submission + success/error state
- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
  - too many shell responsibilities bundled together
- [client/src/components/quiz-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz-card.tsx)
  - playback/effects orchestration mixed with rendering

### 3. Inconsistent async UX ownership

Current problem:

- many screens expose loading/error states locally and inconsistently
- background refetch states are not standardized
- mutation pending feedback is uneven across flows
- some fast interactions show no explicit async affordance beyond disabled controls or nothing at all

Examples:

- review actions use mutation pending flags, but not under a shared async contract
- profile save shows success/error inline, but not from a reusable pending-state pattern
- history and leaderboard refresh states are manual and page-specific
- cluster form data in add-vocabulary has no shared loading primitive

### 4. Layout and responsive concerns are too centralized in one shell component

`layout.tsx` currently mixes:

- information architecture
- responsive behavior
- account affordances
- theme controls
- language controls
- desktop collapse
- mobile drawer state

This makes shell-level responsive hardening riskier than necessary.

### 5. Transport boundary is not fully normalized

The desired rule is:

- React Query owns lifecycle
- services/hooks own request definitions
- pages/components consume declarative state

Current issues:

- some hooks call `apiClient` directly instead of going through a feature/domain service
- one component defines its own query
- audio resolution is embedded inside a browser-interaction hook rather than a clearer data adapter boundary

## Target layering contract

Phase 9 should enforce this layering model.

### Layer 1: Route shell / page

Responsibilities:

- route entry
- route params and page composition
- wiring feature containers into shell/layout

Must not own:

- API request construction
- domain transformations
- non-trivial derived data shaping
- business workflows beyond trivial event wiring

Target shape:

- page should mostly read like composition, not orchestration

### Layer 2: Feature container / view-model

Responsibilities:

- coordinate queries and mutations
- derive page-ready state
- own URL/query-param synchronization when feature-specific
- map domain responses into view-oriented sections
- expose render-ready actions, flags, and derived values

This is the preferred home for:

- page-specific filters
- sorting state
- pagination state
- summary cards
- CTA rules
- async UX state mapping

### Layer 3: Service/data adapter

Responsibilities:

- transport details
- request construction
- response parsing
- feature-owned mutation/query functions

Rules:

- Axios may remain the transport adapter
- React Query owns lifecycle in hooks or feature containers
- components and pages do not call `apiClient` directly

### Layer 4: Presentational feature component

Responsibilities:

- render feature-specific UI from props
- emit events
- remain agnostic to transport and query libraries

Allowed:

- minimal ephemeral UI state such as accordion open/close, currently selected tab, or controlled input visuals

Not allowed:

- request orchestration
- domain rules
- feature-wide derived state calculations

### Layer 5: UI primitive

Responsibilities:

- design-system-level rendering primitive only

Examples:

- button
- input
- dialog
- sheet
- skeleton
- table

Rules:

- never import feature hooks
- never import domain services
- never own product logic

## File ownership rules to enforce

### Pages

Pages should only import:

- layout/shell wrappers
- feature view-models
- presentational components
- router primitives

Pages should not define:

- custom data queries
- custom mutation flows
- large filtering/sorting/paging pipelines

### Feature modules

Each major screen should eventually have a feature module with:

- `use-*-view-model.ts`
- optional `*.constants.ts`
- optional `*.types.ts`
- optional feature-specific presentational sections

### Shared hooks

Shared hooks should be:

- reusable across features
- focused on cross-page data access or browser capabilities

If a hook is only meaningful for one page family, it should move into that feature folder instead of remaining global.

### Services

Services should be:

- transport-oriented
- contract-oriented
- free of UI state

## Migration buckets

### Bucket A - Architecture foundation

Scope:

- complete `P9-001`
- define the target contract
- identify all boundary leaks

Output:

- this document

### Bucket B - Query and async contract foundation

Scope:

- `P9-002`
- `P9-003`
- `P9-004`

Reason:

- do this before page rewrites so all later feature work uses one async vocabulary

### Bucket C - Shell and responsive foundation

Scope:

- `P9-005`
- layout shell
- navigation responsiveness
- shared mobile layout patterns

Reason:

- prevents repeating page-level responsive fixes without a shell contract

### Bucket D - Learner feature migrations

Execution order:

1. dashboard
2. quiz
3. clusters
4. contextual
5. history
6. word buckets
7. leaderboard
8. profile
9. auth
10. tutor decision

Reason:

- dashboard and quiz are the most central product surfaces
- clusters/history are currently the largest page-owned orchestration hotspots

### Bucket E - Reviewer/admin migrations

Execution order:

1. review queue
2. review history/details
3. add-vocabulary workflow
4. conflict-related UI alignment if exposed

### Bucket F - Test stabilization after architecture settles

Execution order:

1. backend invariants
2. frontend integration coverage
3. E2E and smoke hardening

## Priority hotspots

These files should be treated as the highest-priority architecture hotspots:

- [client/src/pages/clusters.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.tsx)
- [client/src/pages/history.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.tsx)
- [client/src/pages/review.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.tsx)
- [client/src/components/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/create-vocabulary-draft-form.tsx)
- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
- [client/src/hooks/use-hybrid-audio.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-hybrid-audio.ts)
- [client/src/pages/tutor.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/tutor.tsx)

## Acceptance checks for future refactors

The following checks should be used in future Phase 9 implementation work.

### Page thinness check

A page fails the architecture contract if it:

- defines its own network query or mutation
- owns large derived datasets or sorting/filter pipelines
- mixes browser side effects and domain workflow logic
- contains more orchestration than composition

### Presentational replaceability check

A feature component fails the contract if replacing the UI library would require rewriting:

- request orchestration
- domain rules
- summary/CTA computation
- feature-wide state machines

### Async ownership check

A feature fails the contract if:

- request lifecycle is hidden in arbitrary components
- loading/error/pending semantics are page-specific and undocumented
- mutation pending feedback is missing or inconsistent

### Shared primitive adoption check

A page fails the contract if it introduces:

- one-off skeleton markup
- one-off empty-state conventions
- one-off retry/error panels

before the shared primitives are defined and adopted.

## Phase follow-up status

The historical next implementation target from this baseline is complete: `P9-002` established the UI-facing request inventory and React Query ownership rules.
