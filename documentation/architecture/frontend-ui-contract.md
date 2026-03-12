# Frontend UI Contract

This document is the canonical frontend implementation contract for request ownership, async UX, shared state primitives, and responsive behavior.

Visual foundation, layout primitives, and design-system governance live in [continuum-design-system.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/continuum-design-system.md).

## Request ownership

- React Query owns transport-backed request lifecycle.
- Transport adapters live in `client/src/services/*`.
- Shared query and mutation ownership lives in `client/src/hooks/*`.
- Route orchestration lives in `client/src/features/*/use-*-view-model.ts`.
- Pages and presentational components must not call `apiClient` directly or define transport-backed `useQuery` and `useMutation` calls.

## Query-key and invalidation rules

- Query keys use stable positional tuples.
- Resource key comes first, scope variables come next, pagination or filter variables come last.
- The module that defines a query also owns its key builder and invalidation expectations.
- Invalidation should be narrow by default.
- Broad invalidation is reserved for truly global or admin mutations and should be explicit.

## Async UX rules

Every API-backed interaction must produce visible feedback.

Supported async states:

- initial query load
- background refetch
- mutation pending
- destructive or high-risk mutation pending
- filter, sort, page, or route-derived refetch pending
- bootstrap redirect or auth handshake

Required behaviors:

- preserve existing content during background refetch when it is still safe to show
- show visible pending state on the triggering control during mutations
- block duplicate or conflicting actions
- keep async feedback local to the affected surface unless the entire route is in bootstrap state
- always provide visible error and empty states where applicable

## Shared UI-state primitives

The client should standardize on:

- `PageSkeleton`
- `CardGridSkeleton`
- `TableSkeleton`
- `SectionLoader`
- `InlineRefreshIndicator`
- `PendingButton`
- `EmptyState`
- `ErrorState`

Rules:

- pages should compose these primitives instead of handcrafting repeated loading and error markup
- feature components may wrap them with feature-specific copy
- shared primitives must remain domain-agnostic
- avoid page-specific retry cards, bordered loading boxes, or “disabled only” pending states

## Responsive bar

Core product surfaces must work on phone and desktop widths without horizontal overflow or loss of primary actions.

Required behaviors:

- mobile-first changes must preserve desktop quality
- loading, empty, and error states must use the same layout container rules as the success state
- dense data surfaces must degrade intentionally through stacked cards, wrapped controls, or stacked panes
- critical flows must not depend on hover-only affordances

High-risk responsive surfaces:

- authenticated layout shell
- clusters
- history and analytics
- review queue and history panel
- add-vocabulary form
- quiz session surface

## Testing expectation

Changes that affect this contract should keep the related route integration tests, component tests, and smoke coverage aligned. See [testing-release-gates.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/operations/testing-release-gates.md).
