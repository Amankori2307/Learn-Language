# Responsive UI Baseline

This document is the execution baseline for `P9-005`. It defines the responsive/adaptive UI contract for the app shell and core product surfaces.

## Objective

Make the app reliably usable on phones, tablets, laptops, and desktops without relying on one-off page fixes.

This baseline exists to ensure:

- mobile behavior is designed deliberately
- async/loading states fit into the responsive model
- shell-level behavior is stabilized before page-level rewrites

## Device tiers

Use these conceptual tiers during implementation and review:

- phone:
  - narrow single-column layout
- large phone:
  - single-column layout with more breathing room
- tablet:
  - mixed single/two-column depending on surface
- laptop:
  - primary desktop layout
- desktop:
  - full-width, denser layout allowed where readability remains strong

The exact CSS breakpoints can follow the existing Tailwind setup, but the behavior contract below must remain stable.

## Global responsive rules

### Rule 1: No horizontal overflow on core routes

Core routes must not horizontally overflow on phone widths:

- dashboard
- quiz
- clusters
- analytics/history
- word buckets
- leaderboard
- profile
- review
- add vocabulary

### Rule 2: Primary action must remain discoverable

The main action for each route must remain visible or clearly reachable on mobile.

Examples:

- dashboard primary learn CTA
- quiz answer controls
- review approve/reject actions
- profile save button
- add-vocabulary submit action

### Rule 3: Async states must not break layout

Loading, empty, and error states must use the same layout container rules as the content they replace.

This prevents:

- layout jumps
- content collapse
- mobile-only overflow bugs caused by skeleton mismatch

### Rule 4: No hover-only affordances for critical flows

Important actions and meaning must not depend on hover.

### Rule 5: Dense data surfaces must degrade intentionally

Tables, split panes, and long filter bars should adapt into:

- stacked cards
- collapsible filters
- horizontally segmented but non-overflowing action groups
- drawer/sheet-based secondary controls when needed

## Shell-level assessment

Current shell hotspot:

- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)

Current responsibilities in shell:

- desktop sidebar
- mobile sheet navigation
- collapse/expand state
- user profile modal
- theme toggle
- language selector
- nav grouping

Risk:

- shell currently bundles too many concerns, so responsive changes can accidentally affect unrelated behavior

## Shell contract to enforce

### Navigation

Mobile:

- navigation should open via sheet/drawer
- primary destination list must remain easy to scan
- language selector and account controls must not crowd out nav actions

Desktop:

- sidebar may remain visible
- collapse mode is allowed
- collapsed mode must preserve navigation clarity through icons and accessible labels

### Account and preferences

Mobile:

- account controls and theme/language controls must not consume excessive first-screen space inside the nav sheet
- modal triggers must remain accessible but secondary to navigation

### Content area

All pages should render inside a content container that:

- avoids double horizontal padding issues
- avoids width assumptions tied to one sidebar width
- keeps top-level action rows wrap-safe

## Page-family adaptation rules

### Dashboard

Required behavior:

- hero section stacks vertically on phone
- CTA group wraps cleanly
- stat/bucket cards collapse to one column on narrow widths
- no clipped button text

### Quiz

Required behavior:

- question and answer layout remains usable on phone
- answer options remain tap-friendly
- confidence controls wrap cleanly
- result/next-step CTAs remain visible without awkward overflow

Special caution:

- quiz loading and pending states must preserve the single-focus learning flow

### Clusters and analytics tables

Required behavior:

- filter controls stack or wrap cleanly
- table surfaces adapt to card/list style or horizontally safe condensed layout
- pagination remains reachable

Do not rely on:

- wide desktop table assumptions

### Review queue and history split pane

Required behavior:

- on smaller widths, queue and history/detail regions must stack rather than compress into unusable columns
- bulk action controls must wrap cleanly
- row actions must remain reachable without text clipping

### Profile and auth

Required behavior:

- forms remain single-column friendly
- save/login actions remain prominent
- avatar and profile summary do not crowd form fields

### Add vocabulary

Required behavior:

- large forms remain readable on phone
- field groups stack cleanly
- example rows stay usable without horizontal overflow
- submit action remains reachable after long content

## Common failure modes to catch

### Shell failures

- mobile drawer too dense to scan
- collapsed desktop sidebar loses navigation clarity
- content offset mismatch when sidebar changes width

### Data-surface failures

- tables overflowing horizontally
- action bars wrapping into unreadable button stacks
- filters forcing sideways scroll

### Form failures

- multi-column inputs staying side-by-side too long on narrow widths
- submit controls disappearing below heavy content without clear progression

### Async-state failures

- skeletons wider than content
- empty/error cards using different spacing than success state
- refresh indicators shifting action rows unpredictably

## Remediation patterns

Use these patterns during implementation.

### For large tables

Prefer:

- stacked cards on phone
- simplified columns on tablet
- full table on laptop/desktop

### For filter/action rows

Prefer:

- wrapped rows
- collapsible filter sections
- grouped primary and secondary controls

### For split panes

Prefer:

- stacked sections on small screens
- split layout only when both panes remain genuinely readable

### For long forms

Prefer:

- single-column default on phone
- grouped sections with clear headings
- sticky or repeated submit affordance only if necessary and safe

## Priority responsive hotspots

These should be treated as the first responsive implementation targets:

- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
- [client/src/pages/clusters.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.tsx)
- [client/src/pages/history.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.tsx)
- [client/src/pages/review.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.tsx)
- [client/src/components/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/create-vocabulary-draft-form.tsx)
- [client/src/pages/quiz.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/quiz.tsx)
- [client/src/components/quiz-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz-card.tsx)

## Implementation priority order

Responsive implementation should proceed in this order:

1. layout shell
2. dashboard
3. quiz
4. clusters
5. history / analytics
6. review
7. add vocabulary
8. profile and auth
9. lower-priority residual surfaces

## Acceptance checks for `P9-005`

`P9-005` is complete only when:

- shell behavior is defined for mobile and desktop
- page-family adaptation rules are documented
- high-risk responsive hotspots are identified
- implementation order is locked before page rewrites begin

## Immediate next dependency

After `P9-005`, the next correct work is page-level refactor execution under `P9-006` and `P9-007`.

