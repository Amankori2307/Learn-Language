# Frontend Coverage Matrix

This document is the execution baseline for `P9-009A`. It records current automated frontend coverage by core surface and state type so the remaining Phase 9 coverage work can target real gaps instead of guesswork.

Status legend:

- `covered`: protected by current page integration and/or focused component tests
- `partial`: some state branches are covered, but at least one important branch remains unprotected
- `gap`: no meaningful automated protection yet for that state type

## Learner surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dashboard` | `covered` | `covered` | `gap` | `covered` | `partial` | `partial` | loading, retryable error, and default primary-action behavior are covered; an explicit empty/zero-data interpretation is still not |
| `quiz` | `covered` | `partial` | `covered` | `covered` | `covered` | `partial` | quiz completion and active-session shell are covered; explicit route-level error fallback remains thin |
| `clusters` | `covered` | `covered` | `covered` | `covered` | `partial` | `partial` | search/filter interaction and request-failure handling are covered; responsive assertions are still absent |
| `contextual` | `covered` | `covered` | `covered` | `covered` | `partial` | `partial` | cluster selection and request-failure handling are covered; responsive assertions are still absent |
| `history` | `covered` | `covered` | `covered` | `covered` | `covered` | `partial` | strongest learner-page state coverage so far |
| `leaderboard` | `partial` | `covered` | `covered` | `covered` | `partial` | `partial` | window-switch interaction is covered indirectly through header tests, but loading-state page composition is still thin |
| `word-buckets` | `covered` | `covered` | `covered` | `covered` | `covered` | `partial` | bucket switching is covered, but responsive assertions are still absent |
| `profile` | `partial` | `covered` | `gap` | `covered` | `covered` | `partial` | save flow and retryable error are covered; route-level loading composition is only indirectly protected |
| `auth` | `partial` | `gap` | `n/a` | `covered` | `covered` | `partial` | sign-in CTA, pending button, and bootstrap/redirect handshake are covered; explicit auth-route failure handling is still absent |
| `tutor` | `gap` | `gap` | `gap` | `covered` | `covered` | `partial` | intentionally lower priority until tutor retention is finalized |

## Reviewer/admin surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Role-gated | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `review` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | `partial` | queue/history loading, error, empty, actions, and role denial are now covered; responsive assertions remain the main gap |
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

1. `dashboard`: decide whether zero-data/default-stat composition deserves its own explicit empty-state assertions beyond the current loading/error/success coverage.
2. `auth`: decide whether `/auth` needs an explicit failure surface beyond the current bootstrap/redirect behavior.
3. responsive regression checks: add high-signal assertions for the main action rows and mobile stacking behavior already refactored in leaderboard, history, review, and word-buckets.

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
