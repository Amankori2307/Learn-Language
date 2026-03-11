# Frontend Coverage Matrix

This document is the execution baseline for `P9-009A`. It records current automated frontend coverage by core surface and state type so the remaining Phase 9 coverage work can target real gaps instead of guesswork.

Status legend:

- `covered`: protected by current page integration and/or focused component tests
- `partial`: some state branches are covered, but at least one important branch remains unprotected
- `gap`: no meaningful automated protection yet for that state type

## Learner surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dashboard` | `partial` | `gap` | `gap` | `covered` | `gap` | `partial` | page integration currently protects the populated dashboard shell only |
| `quiz` | `covered` | `partial` | `covered` | `covered` | `covered` | `partial` | quiz completion and active-session shell are covered; explicit route-level error fallback remains thin |
| `clusters` | `covered` | `gap` | `covered` | `covered` | `partial` | `partial` | search/filter interaction is covered, but a request-failure branch is still not protected at page level |
| `contextual` | `covered` | `gap` | `covered` | `covered` | `partial` | `partial` | cluster selection is covered; explicit failure treatment is not |
| `history` | `covered` | `covered` | `covered` | `covered` | `covered` | `partial` | strongest learner-page state coverage so far |
| `leaderboard` | `partial` | `covered` | `covered` | `covered` | `partial` | `partial` | window-switch interaction is covered indirectly through header tests, but loading-state page composition is still thin |
| `word-buckets` | `covered` | `covered` | `covered` | `covered` | `covered` | `partial` | bucket switching is covered, but responsive assertions are still absent |
| `profile` | `partial` | `covered` | `gap` | `covered` | `covered` | `partial` | save flow and retryable error are covered; route-level loading composition is only indirectly protected |
| `auth` | `gap` | `gap` | `n/a` | `covered` | `covered` | `partial` | sign-in CTA and pending button are covered; bootstrap/redirect handshake should still get direct route-level protection |
| `tutor` | `gap` | `gap` | `gap` | `covered` | `covered` | `partial` | intentionally lower priority until tutor retention is finalized |

## Reviewer/admin surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Role-gated | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `review` | `partial` | `partial` | `gap` | `covered` | `covered` | `covered` | `partial` | bulk/per-item actions and learner denial are covered; queue/history failure composition is still thin |
| `add-vocabulary` | `partial` | `partial` | `n/a` | `covered` | `covered` | `covered` | `partial` | create flow, access gating, cluster-loading, and submit pending are covered; explicit create-failure page composition is still thin |

## Shared presentation / async primitives

| Surface | Behavior coverage | Status | Notes |
| --- | --- | --- | --- |
| `page-states` primitives | loading / empty / error compositions | `covered` | direct primitive tests exist |
| `pending-button` | pending label and disabled semantics | `covered` | direct component test exists |
| analytics / history headers | refresh pending and CTA forwarding | `covered` | direct tests exist |
| review page fragments | access, header, bulk actions, queue, history | `covered` | direct tests exist for most extracted fragments |
| quiz page states | loading, missing-question, completion, CTA routing | `covered` | direct tests exist |

## Highest-priority remaining gaps

1. `dashboard`: add loading/error integration coverage and confirm the page still composes correctly when stats or insights are missing.
2. `auth`: add route-level bootstrap/redirect coverage so `/auth` no longer depends only on the sign-in panel tests.
3. `clusters` and `contextual`: add request-failure integration coverage.
4. `review`: add explicit queue/history loading-error-empty integration branches.
5. responsive regression checks: add high-signal assertions for the main action rows and mobile stacking behavior already refactored in leaderboard, history, review, and word-buckets.

## Exit criteria for `P9-009`

`P9-009` should be considered complete when:

- every core learner and reviewer page has at least one automated assertion for each applicable state category:
  - loading
  - error
  - empty
  - success
  - pending
  - role-gated or responsive where applicable
- shared async/state primitives remain directly protected
- remaining uncovered states are explicitly deferred in Phase 9 docs rather than left implicit
