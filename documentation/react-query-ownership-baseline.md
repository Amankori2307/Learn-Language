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
- shared hooks now broadly export explicit query-key builders, but the repo-wide convention is still not fully documented
- invalidation strategy is uneven
- query ownership is now broadly aligned; the remaining issues are more about conventions than obvious boundary leaks

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
| answer submit | `useSubmitAnswer` | mutation | healthy enough; invalidation now refreshes learner progress summaries, history, buckets, and leaderboard data touched by answer submission |
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
| cluster list for add-vocabulary form | `useCreateVocabularyDraftForm` via `useClustersForLanguage` | query | healthy; transport/query ownership is delegated to the shared clusters hook |

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
| audio resolve | `useAudioResolution` | mutation-like async side effect | healthy enough; request ownership is separated from browser playback behavior |

## Current request ownership problems

### 1. Query key conventions are mostly implemented but not yet promoted to a repo-wide policy

Current patterns:

- route-path string keys
- route-path plus language
- route-path plus object
- route-path plus page/filter variables

Remaining gap:

- most shared hooks now own and export their key builders, but the repo still lacks one centralized convention policy
- invalidation partials are used without a formal contract
- future refactors could still drift if new hooks do not follow the same ownership pattern

### 2. Invalidation strategy is narrower now, but the policy is still implicit

Examples:

- `useSubmitAnswer` invalidates the main learner progress surfaces, but the repo still has no shared policy for how wide learner mutation invalidation should be
- `useProfile` invalidates profile and auth user
- review mutations invalidate queue/history
- `useSeedData` now invalidates a fixed list of seed-affected resource prefixes, but the repo still has no shared invalidation policy

Remaining gap:

- there is no shared rule for narrow versus broad invalidation beyond this baseline

### 3. Query defaults are now centralized, but the exception policy still needs to stay explicit

Global defaults in [client/src/lib/queryClient.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/lib/queryClient.ts):

- `refetchOnWindowFocus: false`
- `staleTime: Infinity`
- `retry: false`

Feature overrides:

- auth sets finite stale time
- quiz generation sets `staleTime: 0`

Remaining gap:

- the reasons for these exceptions are now formalized in code, but future overrides still need to follow the same shared seam

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
  - invalidate any learner summaries/history views expected to stay fresh immediately after an answer submit

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
  - finite stale time is acceptable and now formalized in `QUERY_BEHAVIOR_RULES.auth`
- quiz generation:
  - `staleTime: 0` because quiz content must be freshly generated per session intent, and this is now formalized in `QUERY_BEHAVIOR_RULES.quiz`
- static-ish reference data such as clusters:
  - can be longer-lived once conventions are documented
- profile/review/analytics:
  - use explicit reasoning per feature rather than inheriting `Infinity` accidentally

The main requirement is not one exact value. It is that each override must be intentional, documented, and preferably owned from one explicit rule seam rather than repeated as ad hoc literals.

## Outcome after `P9-002` follow-up work

The originally identified migration slices are now complete:

- component-level transport-backed query ownership was moved out of learner-facing presentational surfaces
- shared learner hooks now broadly export explicit query-key builders
- auth and quiz query-behavior overrides now live behind a shared rule seam
- add-vocabulary cluster lookup now reuses the shared clusters hook
- audio resolution request ownership is separated from browser playback behavior
- high-impact learner invalidation paths are now narrowed and explicit

## Remaining follow-up work

The remaining work is smaller and more policy-oriented than migration-oriented:

1. document the query-key and invalidation conventions in the repo-wide governance docs so new hooks follow the same ownership model by default
2. keep reviewer/admin surfaces aligned when future mutations or shared hooks are added
3. periodically re-run the inventory if new feature areas introduce direct transport access or ad hoc cache rules

The first follow-up item is now complete through the repo-wide coding guidance and governance docs.

## Acceptance checks for `P9-002`

`P9-002` is complete only when:

- no page file defines transport-backed queries or mutations
- no presentational component imports `apiClient`
- query keys follow a documented structure
- invalidation behavior is intentional and narrow by default
- Axios remains behind service/hook boundaries
- React Query lifecycle ownership is consistent across learner and reviewer flows

That acceptance bar is now met for the current codebase. The remaining debt is about keeping the conventions explicit and enforced as new features are added.
