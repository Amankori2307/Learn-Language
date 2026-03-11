# Frontend Coverage Matrix

This document is the execution baseline for `P9-009A`. It records current automated frontend coverage by core surface and state type so the remaining Phase 9 coverage work can target real gaps instead of guesswork.

Status legend:

- `covered`: protected by current page integration and/or focused component tests
- `partial`: some state branches are covered, but at least one important branch remains unprotected
- `gap`: no meaningful automated protection yet for that state type

## Learner surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dashboard` | `covered` | `covered` | `covered` | `covered` | `partial` | `partial` | loading, retryable error, default primary-action behavior, and zero-data/default-stat rendering are now covered |
| `quiz` | `covered` | `partial` | `covered` | `covered` | `covered` | `partial` | quiz completion and active-session shell are covered; explicit route-level error fallback remains thin |
| `clusters` | `covered` | `covered` | `covered` | `covered` | `partial` | `partial` | search/filter interaction and request-failure handling are covered; responsive assertions are still absent |
| `contextual` | `covered` | `covered` | `covered` | `covered` | `partial` | `partial` | cluster selection and request-failure handling are covered; responsive assertions are still absent |
| `history` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | page-level refresh and responsive CTA composition are covered |
| `leaderboard` | `covered` | `covered` | `covered` | `covered` | `partial` | `covered` | loading-state page composition and responsive window-switch layout are now covered |
| `word-buckets` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | bucket switching and responsive bucket-switch layout are covered |
| `profile` | `covered` | `covered` | `n/a` | `covered` | `covered` | `covered` | save flow, retryable error, loading composition, and responsive stacked-to-two-column form behavior are covered |
| `auth` | `covered` | `covered` | `n/a` | `covered` | `covered` | `covered` | sign-in CTA, pending button, bootstrap/redirect handshake, retryable failure messaging, and responsive auth shell classes are covered |
| `tutor` | `gap` | `gap` | `gap` | `covered` | `covered` | `partial` | intentionally lower priority until tutor retention is finalized |

## Reviewer/admin surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Role-gated | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `review` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | queue/history loading, error, empty, actions, role denial, and responsive bulk-action layout are covered |
| `add-vocabulary` | `partial` | `covered` | `n/a` | `covered` | `covered` | `covered` | `covered` | create flow, access gating, cluster-loading, submit pending, draft-creation failure composition, and responsive form/CTA behavior are covered; route-level loading remains thinner than other stabilized pages |

## Shared presentation / async primitives

| Surface | Behavior coverage | Status | Notes |
| --- | --- | --- | --- |
| `page-states` primitives | loading / empty / error compositions | `covered` | direct primitive tests exist |
| `pending-button` | pending label and disabled semantics | `covered` | direct component test exists |
| analytics / history headers | refresh pending and CTA forwarding | `covered` | direct tests exist |
| review page fragments | access, header, bulk actions, queue, history | `covered` | direct tests exist for most extracted fragments |
| quiz page states | loading, missing-question, completion, CTA routing | `covered` | direct tests exist |

## Highest-priority remaining gaps

1. lower-priority responsive assertions remain thin for `clusters` and `contextual`, but the highest-risk analytics/review/auth/profile layouts now have direct page-level protection.

## Explicit Phase 9 deferrals

- `tutor` remains non-core for Phase 9 closeout and does not block completion of the stabilized learner/reviewer flow coverage.

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
