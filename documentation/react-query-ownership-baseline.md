# React Query Ownership Baseline

This document is the execution baseline for `P9-002`. It inventories current UI-facing request paths, defines ownership rules for React Query usage, and locks the migration order needed before async UX and loading-state work.

## Objective

Standardize UI-facing data access so:

- React Query owns request lifecycle
- services and feature hooks own request definitions
- pages and presentational components consume declarative query/mutation state
- Axios remains a transport adapter rather than a page/component-level lifecycle owner

## Current state summary

The codebase already uses React Query in many places. This phase is not a greenfield migration from plain Axios to React Query.

Current reality:

- most shared data access hooks already use React Query
- some feature surfaces are already reasonably structured
- request ownership is still inconsistent
- query key conventions are not explicitly documented
- invalidation strategy is uneven
- one component still defines its own query
- one browser capability hook still performs direct API resolution work

## UI-facing request inventory

### Authentication

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| current user fetch | `useAuth` -> `authService.getCurrentUser` | query | healthy |
| logout | `useAuth` mutation -> `authService.logout` | mutation | healthy, but async UX still needs standardization |
| login URL redirect | `authService.getLoginUrl` called from page | bootstrap/browser redirect | acceptable |

### Quiz and learner progress

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| quiz generation | `useGenerateQuiz` | query | healthy |
| answer submit | `useSubmitAnswer` | mutation | healthy, but invalidation only refreshes stats |
| stats | `useStats` | query | healthy |
| learning insights | `useLearningInsights` | query | healthy |
| admin seed | `useSeedData` | mutation | healthy enough; invalidation is now scoped to seed-affected learner/reviewer/admin resources |

### Vocabulary and clusters

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| cluster list | `useClusters` | query | healthy |
| cluster detail | `useCluster` | query | healthy |
| word list | `useWords` | query | healthy |
| word detail | `useWord` | query | healthy |
| cluster list for add-vocabulary form | `useCreateVocabularyDraftForm` | query | healthy; feature hook owns cluster-fetch lifecycle for the draft form |

### Analytics

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| attempt history | `useAttemptHistory` | query | healthy |
| word buckets | `useWordBucket` | query | healthy |
| leaderboard | `useLeaderboard` | query | healthy |

### Profile

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| profile fetch | `useProfile` -> `userService.getProfile` | query | healthy |
| profile update | `useUpdateProfile` -> `userService.updateProfile` | mutation | healthy; invalidation strategy is reasonable |

### Review

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| review queue | `useReviewQueue` -> `reviewService.getQueue` | query | healthy |
| review history | `useReviewHistory` -> `reviewService.getHistory` | query | healthy |
| review transition | `useTransitionReview` | mutation | healthy |
| review bulk transition | `useBulkTransitionReview` | mutation | healthy |
| review draft create | `useCreateReviewDraft` | mutation | healthy |

### Audio

| Flow | Current owner | Classification | Assessment |
| ---- | ------------- | -------------- | ---------- |
| audio resolve | `useHybridAudio` private helper `resolveServerAudioUrl` | mutation-like async side effect | architecture leak; request lifecycle is hidden inside a browser-playback hook |

## Current request ownership problems

### 1. Browser capability hook owns API resolution logic

Problem file:

- [client/src/hooks/use-hybrid-audio.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-hybrid-audio.ts)

Why this is a problem:

- playback behavior and API resolution are coupled
- not expressed through a normal feature-owned async state contract
- makes later async UX and loading semantics harder to standardize

Required future state:

- audio resolution should move behind a clearer adapter/hook boundary
- playback hook should focus on browser/media behavior

### 2. Query key conventions exist but are implicit

Current patterns:

- route-path string keys
- route-path plus language
- route-path plus object
- route-path plus page/filter variables

Problems:

- no documented ownership of key structure
- invalidation partials are used without a formal contract
- future refactors could easily break cache behavior

### 3. Invalidation strategy is inconsistent

Examples:

- `useSubmitAnswer` invalidates stats only
- `useProfile` invalidates profile and auth user
- review mutations invalidate queue/history
- `useSeedData` now invalidates a fixed list of seed-affected resource prefixes, but the repo still has no shared invalidation policy

Problem:

- there is no shared rule for narrow versus broad invalidation

### 4. Query defaults are global but feature-specific overrides are undocumented

Global defaults in [client/src/lib/queryClient.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/lib/queryClient.ts):

- `refetchOnWindowFocus: false`
- `staleTime: Infinity`
- `retry: false`

Feature overrides:

- auth sets finite stale time
- quiz generation sets `staleTime: 0`

Problem:

- the reasons for these exceptions are not formalized

## Ownership rules to enforce

### Rule 1: Pages do not define request functions

Pages may:

- call feature hooks
- call view-model hooks
- invoke actions returned by those hooks

Pages may not:

- call `apiClient`
- define `useQuery`
- define `useMutation`
- construct API URLs

### Rule 2: Presentational components do not define transport-backed queries

Presentational or feature components may:

- receive data
- receive loading/error flags
- emit events

They may not:

- import `apiClient`
- define request functions
- own transport-backed React Query definitions

Exception policy:

- only true feature-container components may define queries, and only if that container is explicitly acting as the feature orchestration boundary

### Rule 3: React Query lifecycle belongs in hooks or feature view-model layers

Preferred ownership:

- cross-feature/shared data access:
  - `client/src/hooks/*`
- page-specific orchestration and composition:
  - `client/src/features/*/use-*-view-model.ts`

### Rule 4: Axios remains a transport adapter only

Allowed:

- service files
- infrastructure-like hook adapters where the hook is clearly a data-access boundary

Not allowed:

- page files
- presentational components
- low-level UI primitives

## Query key contract

### Key structure rules

Use this shape consistently:

- primary resource key first
- scope variables next
- view-specific pagination/filter variables last

Examples:

- auth user:
  - `["/api/auth/me"]`
- profile:
  - `["/api/auth/profile"]`
- clusters by language:
  - `["/api/clusters", language]`
- cluster detail:
  - `["/api/clusters/:id", id, language]`
- quiz generation:
  - `["/api/quiz/generate", mode, clusterId ?? null, language]`
- word bucket:
  - `["/api/analytics/word-buckets", bucket, page, limit, language]`

Avoid:

- object literals in keys when a stable positional tuple is enough
- one-off string suffixes like `"draft-form"` unless they represent a real ownership distinction

### Key ownership rule

The module that defines the query should also define:

- the query key shape
- the request function
- the invalidation expectations

## Invalidation contract

### Use narrow invalidation by default

Invalidate only the resources impacted by a mutation.

Examples:

- profile update:
  - invalidate profile
  - invalidate auth user if rendered user fields depend on profile fields
- review transition:
  - invalidate review queue
  - invalidate review history for affected item if visible
- quiz answer submit:
  - invalidate stats
  - consider invalidating any current learning-insight summaries impacted by attempt results if those views are expected to stay fresh

### Broad invalidation is allowed only for exceptional admin/global mutations

Current broad invalidation hotspot:

- `useSeedData`

Rule:

- document why broad invalidation is needed
- prefer scoped invalidation unless the operation truly invalidates most cached resources

## Retry and stale-time contract

### Default query behavior

Keep global defaults conservative:

- `retry: false`
- `refetchOnWindowFocus: false`

This is currently aligned with the app’s behavior and avoids noisy retries on auth-gated routes.

### Stale-time rules

- auth/user identity:
  - finite stale time is acceptable
- quiz generation:
  - `staleTime: 0` because quiz content must be freshly generated per session intent
- static-ish reference data such as clusters:
  - can be longer-lived once conventions are documented
- profile/review/analytics:
  - use explicit reasoning per feature rather than inheriting `Infinity` accidentally

The main requirement is not one exact value. It is that each override must be intentional and documented.

## Migration order for `P9-002`

### Step 1

Move all component-level queries into hooks or feature view-models.

Immediate target:

- `CreateVocabularyDraftForm`

### Step 2

Normalize key structure and invalidation expectations in shared hooks.

Highest-priority hooks:

- `use-quiz`
- `use-review`
- `use-profile`
- `use-clusters`
- `use-leaderboard`
- `use-attempt-history`

### Step 3

Refactor page-specific orchestration into feature view-models where pages currently combine:

- URL-state synchronization
- filtering/sorting/pagination
- request consumption
- summary derivation

Highest-priority pages:

- clusters
- history
- review

### Step 4

Separate audio resolution request logic from browser playback ownership.

### Step 5

Re-run inventory after learner surfaces stabilize, then align reviewer/admin surfaces.

## Immediate implementation priorities

The first code migrations under `P9-002` should target:

1. cluster query ownership in add-vocabulary
2. query key normalization for high-traffic learner hooks
3. page-level orchestration extraction for clusters/history/review

## Acceptance checks for `P9-002`

`P9-002` is complete only when:

- no page file defines transport-backed queries or mutations
- no presentational component imports `apiClient`
- query keys follow a documented structure
- invalidation behavior is intentional and narrow by default
- Axios remains behind service/hook boundaries
- React Query lifecycle ownership is consistent across learner and reviewer flows
