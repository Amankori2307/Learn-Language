# Frontend Coverage Matrix

This document records current automated frontend coverage by core surface and state type.

Status legend:

- `covered`: protected by current page integration and/or focused component tests
- `partial`: some state branches are covered, but at least one important branch remains unprotected
- `gap`: no meaningful automated protection yet for that state type

## Learner surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dashboard` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | loading, retryable error, zero-data/default-stat rendering, route-level learner action wiring, and responsive hero/grid classes are covered |
| `quiz` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | quiz completion, active-session shell, dedicated route-level error fallback, and responsive session/card layout classes are covered |
| `clusters` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | search/filter interaction, pagination forwarding, practice-link wiring, request-failure handling, and responsive filter/pagination classes are covered |
| `contextual` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | cluster selection, workout-CTA wiring, request-failure handling, and responsive header/story-grid classes are covered |
| `history` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | page-level refresh and responsive CTA composition are covered |
| `leaderboard` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | loading-state page composition, route-level window switching, pending disable-state, and responsive window-switch layout are covered |
| `word-buckets` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | bucket switching and responsive bucket-switch layout are covered |
| `profile` | `covered` | `covered` | `n/a` | `covered` | `covered` | `covered` | save flow, retryable error, loading composition, and responsive stacked-to-two-column form behavior are covered |
| `auth` | `covered` | `covered` | `n/a` | `covered` | `covered` | `covered` | sign-in CTA, pending button, bootstrap/redirect handshake, retryable failure messaging, and responsive auth shell classes are covered |
| `tutor` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | route-owned loading/error/empty states and responsive stacked-to-row tutor composer layout are covered, but tutor remains lower priority until retention is finalized |

## Reviewer/admin surfaces

| Surface | Loading | Error | Empty | Success / normal render | Pending / interaction | Role-gated | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `review` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | `covered` | queue/history loading, error, empty, actions, role denial, and responsive bulk-action layout are covered |
| `add-vocabulary` | `covered` | `covered` | `n/a` | `covered` | `covered` | `covered` | `covered` | route-owned cluster bootstrap loading, create flow, access gating, submit pending, draft-creation failure composition, and responsive form/CTA behavior are covered |

## Shared presentation / async primitives

| Surface | Behavior coverage | Status | Notes |
| --- | --- | --- | --- |
| `page-states` primitives | loading / empty / error compositions | `covered` | direct primitive tests exist |
| `pending-button` | pending label and disabled semantics | `covered` | direct component test exists |
| analytics / history headers | refresh pending and CTA forwarding | `covered` | direct tests exist |
| review page fragments | access, header, bulk actions, queue, history | `covered` | direct tests exist for most extracted fragments |
| quiz page states | loading, missing-question, completion, CTA routing | `covered` | direct tests exist |

## Current status

- route-level frontend coverage is broadly in place across core learner and reviewer surfaces
- the matrix is now primarily a maintenance inventory, not an active gap tracker
- new route or state work should update this file when it changes the automated coverage shape

## Explicit lower-priority note

- `tutor` remains non-core for prioritization purposes even though basic route-state coverage now exists.

## Maintenance bar

Keep this coverage baseline healthy by ensuring:

- every core learner and reviewer page has at least one automated assertion for each applicable state category:
  - loading
  - error
  - empty
  - success
  - pending
  - role-gated or responsive where applicable
- shared async/state primitives remain directly protected
- remaining uncovered states are explicitly deferred in Phase 9 docs rather than left implicit
