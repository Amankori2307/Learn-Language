# UI State Primitives Baseline

This document defines the shared loading, skeleton, empty, error, and pending-state primitives used across the app.

## Objective

Replace page-specific loading and error markup with a shared vocabulary of reusable state primitives.

This is required so that:

- async UX becomes consistent
- responsive hardening does not re-implement loading states per page
- pages stay thin during refactors
- tests can target stable state patterns

## Primitive inventory

The client should standardize on these primitives.

### 1. `PageSkeleton`

Use for:

- route-level initial loading where the page has no usable prior data

Should support:

- heading area
- action row
- body blocks with configurable density

Primary targets:

- dashboard
- profile
- leaderboard
- review

### 2. `CardGridSkeleton`

Use for:

- dashboard cards
- grid-heavy learner surfaces
- summary sections

Primary targets:

- dashboard stats and core action areas
- contextual card-like content when needed

### 3. `TableSkeleton`

Use for:

- list/table screens with headers and row placeholders

Primary targets:

- clusters
- history
- leaderboard desktop table
- word buckets
- review queue

### 4. `SectionLoader`

Use for:

- localized loading state inside an already-rendered page

Examples:

- right-side review history panel
- cluster detail panel
- modal/detail region

### 5. `InlineRefreshIndicator`

Use for:

- background refetch states
- manual refresh actions
- filter/sort/page-change reloads where old content remains visible

Examples:

- history refresh
- leaderboard refresh
- word bucket pagination

### 6. `PendingButton`

Use for:

- mutations
- submit/save/approve/reject actions

Must support:

- pending label
- disabled state
- optional spinner/icon slot

Primary targets:

- quiz answer submission
- profile save
- review approve/reject
- bulk review actions
- create draft

### 7. `EmptyState`

Use for:

- successful request with no content

Must support:

- title
- explanatory copy
- optional CTA

Primary targets:

- review queue empty
- word bucket empty
- leaderboard empty
- history no matching results
- contextual no lines

### 8. `ErrorState`

Use for:

- retryable request failures

Must support:

- title/message
- optional retry action
- optional compact and full-page variants

Primary targets:

- profile load failure
- leaderboard load failure
- history load failure
- review queue/history load failure
- word bucket load failure

## Usage boundaries

### Pages should compose state primitives

Pages should not handcraft repeated:

- bordered loading cards
- red error panels
- empty list placeholders
- generic retry blocks

### Feature components may compose primitives

Feature components may:

- combine primitives into page-specific state sections
- pass feature-specific copy

They should not:

- define entirely new loading semantics unless the feature shape truly differs

### UI primitives remain domain-agnostic

The shared state primitives should not know:

- quiz
- review
- analytics
- profile

They should only know about generic layout/state presentation.

## Page-state matrix

### Dashboard

Needs:

- `PageSkeleton`
- `CardGridSkeleton`
- compact `ErrorState`

### Quiz

Needs:

- dedicated route-level loading treatment for session generation
- `PendingButton` for answer submission
- localized error/empty handling for zero-question or failed session states

Note:

- quiz may need a feature-specific wrapper around shared primitives rather than a generic table/card primitive

### Clusters

Needs:

- `TableSkeleton`
- `InlineRefreshIndicator`
- `EmptyState`
- `ErrorState`

### Contextual

Needs:

- section or card-grid skeleton
- `EmptyState`
- localized error treatment if cluster/context load fails

### History / analytics

Needs:

- `TableSkeleton`
- `InlineRefreshIndicator`
- `EmptyState`
- `ErrorState`

### Word buckets

Needs:

- `TableSkeleton`
- `InlineRefreshIndicator`
- `EmptyState`
- `ErrorState`

### Leaderboard

Needs:

- `PageSkeleton` or table/list skeleton depending on viewport
- `InlineRefreshIndicator`
- `EmptyState`
- `ErrorState`

### Profile

Needs:

- `PageSkeleton`
- `PendingButton`
- `ErrorState`
- localized success state pattern

### Auth

Needs:

- explicit bootstrap/loading state
- not a generic skeleton-heavy surface

### Review

Needs:

- `TableSkeleton`
- `SectionLoader`
- `PendingButton`
- `EmptyState`
- `ErrorState`

### Add vocabulary

Needs:

- localized query loading for cluster options
- `PendingButton`
- standardized form error/success treatment

## Accessibility and motion rules

### Accessibility

All primitives must:

- preserve readable state messaging
- not rely on color alone
- keep button pending text understandable
- ensure retry affordances are keyboard reachable

### Motion

Skeletons and refresh indicators must:

- work with reduced motion
- avoid aggressive shimmer or infinite distracting animation

## Current anti-patterns to continue avoiding

- page-specific bordered loading boxes repeated across screens
- page-specific retry cards repeated with slight copy changes
- mutation pending expressed only by disabling a button with no visual change
- empty states that are just plain text with no consistent structure

## Current acceptance bar

This primitive layer is healthy when:

- the primitive set is defined
- each core page maps to a known state primitive set
- accessibility and motion constraints are documented
- new surfaces reuse these primitives or extend them intentionally instead of bypassing them
