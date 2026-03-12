# Async UX Contract

This document is the execution baseline for `P9-003`. It defines how the frontend must expose async behavior for all API-backed work.

## Core rule

Every API-backed interaction must produce visible UI feedback.

This applies even when the operation is fast. The goal is not to exaggerate loading time. The goal is to make async behavior legible and trustworthy.

## Why this is required

Without a shared async contract, the app drifts into:

- silent mutations
- inconsistent loading treatments
- pages that hide background refetches
- controls that feel broken because no feedback appears
- hard-to-test behavior because pending semantics are implicit

## Async state taxonomy

All API-backed work must map into one of these states.

### 1. Initial query load

Definition:

- first render where required data is not yet available

Required UX:

- visible page, section, card, or table loading treatment
- no blank screen unless the route is explicitly a bootstrap gate

Examples:

- dashboard initial load
- leaderboard initial load
- review queue initial load

### 2. Background refetch

Definition:

- data already exists on screen, but a refresh is happening in the background

Required UX:

- keep existing content visible
- show a lighter refresh indicator
- do not collapse back to full-page skeleton unless the data is truly invalidated

Examples:

- manual refresh on analytics/history
- leaderboard window switch if previous data remains visible

### 3. Mutation pending

Definition:

- user-triggered write action is in flight

Required UX:

- the triggering control must show a pending state
- duplicate submissions must be prevented
- surrounding UI should remain readable when safe

Examples:

- submit quiz answer
- save profile
- bulk approve/reject review items
- create vocabulary draft

### 4. Destructive or high-risk mutation pending

Definition:

- a mutation changes review state, discards choices, or performs a materially important action

Required UX:

- target control must show stronger pending feedback than a generic save
- duplicate clicks must be blocked
- user should retain enough context to understand what is being changed

Examples:

- reject review item
- bulk reject

### 5. Pagination, filter, sort, or route-derived refetch pending

Definition:

- the view is reloading due to user navigation inside the same feature surface

Required UX:

- keep layout stable
- surface an inline/table/list refresh treatment
- avoid blanking the entire page if previous results are still useful

Examples:

- cluster filter/sort/page changes
- history filter changes
- word bucket page changes

### 6. Bootstrap redirect/auth handshake

Definition:

- route is performing a token bootstrap, auth redirect, or one-time app entry state recovery

Required UX:

- explicit progress message or branded loading screen
- never leave the user on a dead-looking page

Examples:

- `/auth` reading token from URL and redirecting

## Visual semantics by state

### Initial query load

Use:

- page skeleton
- section skeleton
- table/list skeleton
- card-grid skeleton

Do not use:

- tiny inline spinner alone for full-page content

### Background refetch

Use:

- inline refresh text
- subtle spinner near heading/toolbar
- disabled refresh button with pending label if user initiated it

Do not use:

- full-screen replacement skeleton

### Mutation pending

Use:

- pending label on the action button
- disabled relevant controls
- optional inline helper text near the action region

Do not use:

- invisible pending work
- page-wide overlay for a small local mutation

### Destructive/high-risk mutation pending

Use:

- pending label on the destructive action
- disabled competing destructive controls
- keep affected row/card/context visible

### Filter/sort/page-change pending

Use:

- localized list/table refresh indicator
- stable layout
- preserve previous results when possible until replacement arrives

### Auth/bootstrap pending

Use:

- dedicated route-level loading state
- clear text such as "Signing you in..." or "Restoring session..."

## Global versus local feedback

### Local feedback is the default

Use local feedback for:

- page sections
- tables
- cards
- forms
- action buttons

Reason:

- async ownership should remain close to the affected surface

### Global feedback is reserved for true app-level state

Use global feedback only for:

- auth bootstrap
- whole-app shell hydration issues
- rare full-screen route transitions where the route cannot render meaningful partial content

Do not use global overlays for:

- table pagination
- review actions
- profile save
- bucket refetch

## Control disablement rules

### Disable controls when

- duplicate submission would be harmful
- the currently visible data would become invalid during action execution
- the user could issue conflicting mutations

Examples:

- submitting quiz answer
- saving profile
- approving/rejecting the same review item
- bulk review actions

### Do not over-disable unrelated UI

Avoid disabling:

- the whole page for a local action
- read-only content that can stay visible safely
- unrelated navigation unless it creates state corruption risk

## Content retention rules

### Keep content visible during background refetch

Prefer:

- stale-but-visible content with a refresh indicator

Instead of:

- wiping the page back to empty or skeleton

### Replace with skeleton only when

- there is no usable prior content
- the view meaningfully changes shape and stale content would mislead the user

## Current gap inventory

### Learner surfaces

- `dashboard`
  - has simple loading state, but no shared skeleton standard yet
- `quiz`
  - shows large route-level loading and submit pending, but pending semantics are specific to this page
- `clusters`
  - has loading, but filter/pagination updates are not modeled as explicit async view states
- `history`
  - manual refresh is visible, but filter/sort/page-change async semantics are not standardized
- `leaderboard`
  - loading and fetch states exist, but no consistent background-refetch pattern
- `profile`
  - save pending exists, but success/error/pending are local one-offs
- `auth`
  - redirect/bootstrap path needs a clearer dedicated async treatment

### Reviewer/admin surfaces

- `review`
  - mutation pending exists, but per-row, bulk, and history-panel semantics are not standardized
- `add-vocabulary`
  - submit pending exists through mutation state, but cluster fetch and success/error states are component-local and one-off

### Cross-cutting

- no shared distinction between:
  - initial load
  - background refresh
  - form submit pending
  - destructive pending
  - filter/pagination pending

## Async checklist for every API-backed interaction

Before implementation is considered complete, verify:

1. Is there visible UI for initial load?
2. Is there visible UI for background refetch if applicable?
3. Is the triggering control visibly pending during mutation?
4. Are duplicate/conflicting actions blocked?
5. Is existing content preserved when it is still safe to show?
6. Is the feedback local to the affected surface unless global state is truly involved?
7. Is there a visible error path?
8. Is there a visible empty path if the request succeeds with no data?

## Rules for Phase 9 implementation

### Required before page refactors

- shared async state primitives must exist
- page work must map each request state to one of the semantics in this document

### Not allowed

- silent API calls
- mutation work with no visible pending state
- new one-off loading patterns without justification
- blank content regions where the user cannot tell if the app is working

## Phase follow-up status

The historical next dependency from this baseline is complete: `P9-004` established the shared loading, skeleton, empty, and error-state primitives used across the client.
