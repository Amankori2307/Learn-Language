# Phase 9 - Frontend Architecture, Async UX, Responsive UI, and Test Hardening

Status model: `todo` | `doing` | `done` | `blocked`

## Goal

Execute the next improvement phase in a dependency-safe order so we do not redo broad test work after changing architecture, data flow, or UI structure.

This phase focuses on:

- making UI and logic boundaries stronger so the UI library can be swapped later
- standardizing async data access and async user feedback
- improving mobile adaptability and responsive behavior
- normalizing loading, skeleton, empty, and error states across the product
- expanding automated coverage only after the refactor surface stabilizes

## Why this order

The order below is deliberate:

1. Do not start comprehensive UI/E2E coverage before frontend architecture and async patterns stabilize.
2. Strengthen feature-container and presentational boundaries before broad visual/UI library work.
3. Standardize data-fetching and async UX before page-by-page responsive cleanup, because loading and pending states affect layout and interaction design.
4. Build shared loading/state conventions before retrofitting every page independently.
5. Run broad backend/frontend integration, E2E, and smoke expansion after the major refactor surfaces are settled.

This avoids:

- rewriting tests after major UI refactors
- duplicating loading-state work page by page
- coupling UI primitives directly to domain logic again
- having inconsistent async UX across pages

## Scope boundaries

In scope:

- frontend structure
- React Query adoption/standardization for UI-facing API usage
- async request visibility
- page and component loading states
- skeleton states
- responsive/adaptive UI hardening
- backend/frontend test expansion where needed to support stable behavior

Out of scope for this phase:

- replacing the UI library immediately
- large product-scope changes unrelated to architecture/UX/testing
- backend runtime migration
- visual redesign for its own sake without structural payoff

## Phase tasks

| ID     | Status | Task | Depends On | Effort | Done When |
| ------ | ------ | ---- | ---------- | ------ | --------- |
| P9-001 | todo | Produce a frontend architecture baseline and enforce a feature boundary contract for pages, feature view-models, service adapters, and presentational UI | - | M | page-level responsibilities are documented, boundary rules are codified, and target files for migration are identified before refactor work starts |
| P9-002 | todo | Standardize UI-facing data access on React Query patterns and eliminate ad hoc/raw request handling from page components | P9-001 | L | all page-level API interactions flow through query/mutation hooks or feature adapters with consistent query keys, invalidation, retries, and error handling |
| P9-003 | todo | Define and implement a shared async UX contract for queries and mutations | P9-002 | L | every API-backed interaction exposes visible loading or pending feedback, mutation progress is surfaced in UI, and async components follow one consistent contract |
| P9-004 | todo | Introduce shared loading, skeleton, empty, and error state primitives for the main app surfaces | P9-003 | M | reusable state primitives exist and are used by dashboard, quiz, clusters, analytics, review, profile, and auth-adjacent flows |
| P9-005 | todo | Harden layout shell, navigation, and page composition for mobile-first responsive behavior | P9-001,P9-003,P9-004 | L | layout, sidebar/navigation, top-level spacing, and page containers adapt cleanly across mobile, tablet, and desktop widths |
| P9-006 | todo | Refactor core learner pages to keep logic in feature/view-model layers and rendering in replaceable UI components | P9-002,P9-004,P9-005 | XL | dashboard, quiz, clusters, contextual, history, word buckets, leaderboard, profile, and auth flows follow the target separation pattern |
| P9-007 | todo | Refactor reviewer/admin flows to the same architecture and async UX standards | P9-002,P9-004,P9-005 | L | review queue, add vocabulary, review history, and conflict-related surfaces use the same separation and loading conventions |
| P9-008 | todo | Expand backend automated coverage for refactor-sensitive contracts and behavior invariants | P9-006,P9-007 | L | backend unit/integration coverage protects auth, quiz, review, analytics, vocabulary, and audio contracts touched by frontend-driven refactors |
| P9-009 | todo | Expand frontend component/integration coverage for stabilized user flows and state handling | P9-006,P9-007 | XL | frontend tests cover loading, error, empty, success, responsive, and role-gated paths for core learner and reviewer flows |
| P9-010 | todo | Add end-to-end and smoke coverage for the complete production-critical path | P9-008,P9-009 | XL | smoke and E2E suites cover auth, dashboard load, quiz session start/submit, analytics access, review access, and production-like boot flows |

## Micro-task execution map

The top-level tasks above are the phase gates. Actual execution should happen in smaller sub-steps. A top-level task is only `done` after all of its micro-tasks are `done`.

### P9-001 - Frontend architecture baseline

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-001A | todo | Inventory every route/page and map its current data, state, side-effect, and rendering responsibilities | - | each route has a documented responsibility profile and current anti-pattern list |
| P9-001B | todo | Inventory all feature hooks, service files, and shared UI components against the desired layering model | P9-001A | current layer ownership is documented and violations are listed by file |
| P9-001C | todo | Define the target frontend layering contract: route shell, feature container/view-model, service/data adapter, presentational component, UI primitive | P9-001B | target layering rules are explicit and reusable |
| P9-001D | todo | Produce migration buckets for learner flows, reviewer flows, layout shell, and shared state/UI primitives | P9-001C | refactor work is grouped into execution-safe buckets with dependency notes |
| P9-001E | todo | Define acceptance checks for future refactors so pages do not regress into owning business logic again | P9-001D | the phase doc includes concrete pass/fail checks for page thinness and UI replaceability |

### P9-002 - React Query standardization

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-002A | todo | Audit every UI-facing API interaction and classify it as query, mutation, bootstrap fetch, refetch, or local-only state | P9-001E | a complete request inventory exists |
| P9-002B | todo | Define query-key ownership, invalidation rules, stale-time rules, and retry defaults by feature area | P9-002A | shared React Query conventions are documented |
| P9-002C | todo | Identify pages/components still coupling request orchestration directly to rendering and rank them by migration risk | P9-002B | highest-risk files are prioritized |
| P9-002D | todo | Standardize transport boundaries so Axios remains an adapter, not the lifecycle owner in page code | P9-002C | direct lifecycle handling is removed from page components conceptually and documented for implementation |
| P9-002E | todo | Define migration sequence for learner surfaces before reviewer surfaces to minimize invalidation churn | P9-002D | implementation order is locked and justified |

### P9-003 - Async UX contract

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-003A | todo | Define the visual semantics for initial load, background refetch, mutation pending, destructive pending, and pagination/filter pending | P9-002E | each async state has a clear UX treatment |
| P9-003B | todo | Create a rule set for when controls disable, when content remains visible, and when overlays/spinners are appropriate | P9-003A | interaction rules are explicit and consistent |
| P9-003C | todo | Define where global async feedback is allowed versus where local inline feedback is required | P9-003B | global vs local feedback rules are documented |
| P9-003D | todo | Create an async feedback checklist to apply to every API-backed user action | P9-003C | a reusable checklist exists for implementation and review |
| P9-003E | todo | Map current async UX gaps page by page so implementation work can be done without rediscovery | P9-003D | each core surface has a gap list |

### P9-004 - Shared loading and state primitives

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-004A | todo | Define the primitive set: page skeleton, card skeleton, table skeleton, inline loader, pending button, empty state, retryable error state | P9-003E | primitive inventory is finalized |
| P9-004B | todo | Define where each primitive is allowed and where product-specific compositions are preferred | P9-004A | usage boundaries are documented |
| P9-004C | todo | Map each core page to its required loading/empty/error/skeleton states | P9-004B | page-state matrix exists for all core pages |
| P9-004D | todo | Define accessibility and motion constraints for loading primitives | P9-004C | reduced-motion and accessible-state rules are documented |
| P9-004E | todo | Lock adoption order so shared primitives are introduced before page-level responsive cleanup | P9-004D | implementation sequence prevents duplicate local state UIs |

### P9-005 - Responsive and adaptive layout hardening

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-005A | todo | Define responsive breakpoints and layout expectations for phone, large phone, tablet, laptop, and desktop | P9-001E,P9-003E,P9-004E | target responsive behavior is explicit |
| P9-005B | todo | Audit app shell, navigation, and persistent layout affordances for mobile failure modes | P9-005A | shell-level issues are cataloged |
| P9-005C | todo | Audit data-heavy surfaces for overflow, dense controls, and poor tap ergonomics | P9-005B | page-level responsive issues are cataloged |
| P9-005D | todo | Define remediation patterns for tables, split panes, filter bars, action rows, and sticky controls | P9-005C | standard responsive adaptations are documented |
| P9-005E | todo | Create a page-by-page responsive priority order based on user criticality and implementation coupling | P9-005D | responsive implementation order is locked |

### P9-006 - Learner flow refactor

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-006A | todo | Refactor dashboard to the agreed container/view-model/presentational split | P9-002E,P9-004E,P9-005E | dashboard follows the target architecture and shared state primitives |
| P9-006B | todo | Refactor quiz flow with clear boundaries between session orchestration, async feedback, and visual rendering | P9-006A | quiz page and quiz card composition follow the target pattern |
| P9-006C | todo | Refactor clusters and contextual learning flows with shared filter/loading/responsive patterns | P9-006B | cluster/context pages no longer carry ad hoc orchestration logic |
| P9-006D | todo | Refactor analytics surfaces: history, word buckets, leaderboard | P9-006C | analytics pages share common state and responsive conventions |
| P9-006E | todo | Refactor profile and auth surfaces to the same async and presentational contract | P9-006D | auth/profile no longer use inconsistent ad hoc pending and loading patterns |
| P9-006F | todo | Reassess tutor retention or alignment after core learner flows are standardized | P9-006E | tutor is either aligned to the architecture or explicitly documented as non-core/deferred |

### P9-007 - Reviewer/admin flow refactor

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-007A | todo | Refactor review queue list actions and selection state to the agreed pattern | P9-002E,P9-004E,P9-005E | queue actions follow shared async and presentational rules |
| P9-007B | todo | Refactor review history/details panel to separate data orchestration from rendering | P9-007A | detail/history rendering is thin and reusable |
| P9-007C | todo | Refactor add-vocabulary flow, form submission, and pending/error handling | P9-007B | add-vocabulary follows shared mutation UX and boundary rules |
| P9-007D | todo | Align any reviewer-only or conflict-related surfaces to the same primitives and responsive patterns | P9-007C | reviewer/admin surfaces are no longer architectural outliers |

### P9-008 - Backend test expansion

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-008A | todo | Identify backend invariants most likely to be stressed by frontend contract refactors | P9-006F,P9-007D | refactor-sensitive backend invariants are explicitly listed |
| P9-008B | todo | Expand unit coverage for service-level logic in quiz, analytics, review, vocabulary, auth, and audio where gaps remain | P9-008A | service logic risk areas have targeted unit coverage |
| P9-008C | todo | Expand integration coverage for request/response contract stability and authorization boundaries | P9-008B | backend integration tests guard critical contracts |
| P9-008D | todo | Consolidate backend test commands and target suites for reliable local/CI execution | P9-008C | backend coverage additions run predictably |

### P9-009 - Frontend test expansion

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-009A | todo | Create a frontend coverage matrix by page and state type: loading, error, empty, success, pending, responsive | P9-006F,P9-007D | a stabilized page-state coverage map exists |
| P9-009B | todo | Add focused tests for shared state primitives and async feedback behaviors | P9-009A | shared primitive behavior is directly protected |
| P9-009C | todo | Add learner-flow integration coverage for standardized pages | P9-009B | dashboard/quiz/clusters/analytics/auth/profile key states are covered |
| P9-009D | todo | Add reviewer/admin integration coverage for queue, history, and draft creation flows | P9-009C | reviewer/admin stabilized flows are covered |
| P9-009E | todo | Add responsive regression checks for high-risk layouts | P9-009D | layout regressions are detectable in automated frontend tests |

### P9-010 - E2E and smoke coverage

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P9-010A | todo | Define the minimum production-critical end-to-end path set and assign ownership of each path | P9-008D,P9-009E | the final E2E/smoke scope is explicit |
| P9-010B | todo | Implement learner-critical E2E paths: auth bootstrap, dashboard, quiz start, quiz submit, analytics access | P9-010A | learner-critical E2E paths are automated |
| P9-010C | todo | Implement reviewer/admin E2E paths: review access and draft creation | P9-010B | reviewer/admin critical paths are automated |
| P9-010D | todo | Harden smoke suites for development and production-like verification | P9-010C | smoke commands cover boot and critical API/UI availability |
| P9-010E | todo | Document the final test pyramid, commands, and release gating expectations | P9-010D | phase documentation explains how the stabilized test stack is used |

## Sequencing guardrails

### What must not happen early

- Do not start broad E2E expansion before `P9-006` and `P9-007` stabilize.
- Do not add page-specific one-off loading UIs before `P9-004` defines shared primitives.
- Do not perform responsive cleanup before `P9-003` and `P9-004`, because async states affect layout.
- Do not refactor reviewer/admin flows before the learner-flow standards are established unless blocked by a shared primitive dependency.

### Recommended implementation slices

Each implementation slice should be small enough to finish with code, tests, and docs without mixing too many concerns:

1. architecture inventory/documentation
2. query-contract documentation and migration target inventory
3. shared async UX rules
4. shared state primitives
5. shell responsiveness
6. dashboard
7. quiz
8. clusters/context
9. analytics pages
10. auth/profile
11. review queue/history
12. add vocabulary
13. backend coverage expansion
14. frontend coverage expansion
15. E2E and smoke hardening

## Definition of readiness

Do not start a top-level implementation task until:

- its dependencies are `done`
- the prior task's docs are updated
- the target files and acceptance checks are listed
- the expected tests for that slice are named in advance

## Per-slice checklist

For each micro-task implementation slice, record:

- target files
- risk notes
- acceptance checks
- tests to add or update
- follow-up debt explicitly deferred

## Detailed execution notes

### P9-001 - Frontend architecture baseline

Deliverables:

- architecture document section describing:
  - route/page responsibilities
  - feature module responsibilities
  - service/data responsibilities
  - presentational component rules
- inventory of current violations:
  - pages doing too much data shaping
  - UI components containing domain logic
  - duplicated async state handling
  - layout components with desktop-only assumptions

Important rule:

- no broad code motion until the target layering is explicit

### P9-002 - React Query standardization

Intent:

- keep Axios only as the transport layer if needed
- React Query must own request lifecycle in UI-facing code

Required outcomes:

- no page component should perform direct ad hoc API orchestration
- consistent query key ownership
- mutation invalidation strategy documented and applied
- shared conventions for:
  - stale times
  - retries
  - disabled queries
  - optimistic vs non-optimistic mutations

Audit targets:

- all page-level flows
- review forms and queue actions
- profile updates
- quiz start/submit flows
- analytics drill-downs

### P9-003 - Async UX contract

Rule:

- every API call must produce visible feedback, even if the operation is fast

This includes:

- initial query load indicators
- refetch indicators
- mutation pending indicators
- disabled controls while actions are in flight where appropriate
- visual difference between initial loading and background refreshing

Patterns to define:

- query pending
- background refetch
- submit/save pending
- destructive action pending
- pagination/filter change pending

### P9-004 - Shared state primitives

Create a standard set of reusable UI states:

- page skeleton
- table/list skeleton
- card grid skeleton
- inline loader
- submit/pending button state
- empty state
- retryable error state

Goal:

- eliminate one-off loading markup from pages
- ensure all core surfaces have consistent UX

### P9-005 - Responsive and adaptive layout hardening

Targets:

- app shell
- sidebar/navigation behavior
- top action bars
- tables and analytics views
- quiz layout
- review queue/history split panes
- filter panels

Mobile criteria:

- no horizontal overflow on common phone widths
- clear tap targets
- no hidden primary action behind layout collapse
- content hierarchy remains usable without hover assumptions

### P9-006 - Learner page refactor

Priority order inside learner surfaces:

1. dashboard
2. quiz
3. clusters
4. history / analytics
5. word buckets
6. leaderboard
7. profile
8. auth
9. contextual
10. tutor if still retained

Rule:

- move business/data shaping into feature hooks or view-models
- keep page components thin
- keep UI primitives domain-agnostic

### P9-007 - Reviewer/admin refactor

Priority order:

1. review queue
2. add vocabulary flow
3. review history/details
4. conflict surfaces if exposed in UI during the phase

Rule:

- preserve review governance behavior while separating UI and orchestration

### P9-008 - Backend test expansion

Add or deepen:

- unit tests for service-level business rules affected by UI/data-flow changes
- integration tests for contract stability
- auth/review/quiz/analytics invariants

Why later:

- backend behavior should be locked after the frontend contract refactor has settled

### P9-009 - Frontend test expansion

Coverage goals:

- loading states
- empty states
- error states
- success states
- role gating
- mutation pending UI
- responsive rendering for high-risk layouts

Why after architecture work:

- tests should lock the stabilized structure, not fight the refactor

### P9-010 - E2E and smoke coverage

Priority flows:

1. sign-in entry and authenticated app bootstrap
2. dashboard load
3. start quiz
4. answer and submit quiz item
5. analytics/attempt history access
6. reviewer queue access
7. add vocabulary draft
8. production smoke path

## Test strategy by layer

### During refactor tasks

Allowed and recommended:

- narrow regression tests for touched logic
- focused component/integration tests where a refactor would otherwise be risky

Not yet the goal:

- broad comprehensive suite expansion

### After refactor tasks stabilize

Required:

- backend unit coverage expansion
- backend integration coverage expansion
- frontend integration coverage expansion
- E2E flow coverage
- smoke tests for development and production-like paths

## Status tracking

Use this document and the master registry together:

- master registry:
  - active backlog only
- this phase file:
  - full execution rationale
  - detailed notes
  - task-level sequencing

## Exit criteria

Phase 9 is complete only when all of these are true:

- core learner and reviewer flows follow the agreed UI/logic separation pattern
- UI-facing async work is standardized around React Query patterns
- all API interactions have visible pending/loading feedback
- shared loading/skeleton/empty/error states are used across the main product surfaces
- the application is mobile-usable and responsive on core flows
- backend, frontend, E2E, and smoke suites cover the stabilized core flows
- planning docs and active registry are updated to reflect completion
