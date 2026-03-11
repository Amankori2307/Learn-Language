# Mobile-First UI Execution Plan

Status: `planned`  
Owner: Codex  
Date: 2026-03-11

## Objective

Make the application reliably mobile-first across core learner and reviewer flows.

This plan exists to move the app from "partially responsive" to "designed for phones first, then enhanced upward" without relying on one-off route fixes.

## Scope

In scope:

- app shell and navigation
- shared layout/action/filter primitives
- dashboard
- quiz
- clusters
- history
- leaderboard
- word buckets
- profile
- review
- add vocabulary
- auth
- responsive loading / error / empty states
- responsive regression coverage

Out of scope for this pass unless discovered as blocking:

- visual redesign unrelated to responsiveness
- backend/API changes
- data-model changes
- non-core tutor polish

## Baseline references

- responsive contract: [documentation/responsive-ui-baseline.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/responsive-ui-baseline.md)
- frontend coverage state: [documentation/frontend-coverage-matrix.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/frontend-coverage-matrix.md)
- current shell: [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)

## Problem statement

The current UI is responsive in pieces but not consistently mobile-first.

Observed pattern from code review:

- several surfaces still default to desktop/table layouts and only partially degrade on narrow widths
- action groups often become wrap-safe only at some breakpoints instead of being stacked by default
- some layouts still rely on fixed height, width, or compact grid assumptions that are risky on short or narrow screens
- shell/mobile navigation currently mixes primary navigation and secondary controls densely enough to create crowding risk
- form-heavy and data-heavy pages are the main overflow/compression risk areas

## Execution rules

### Rule 1: Phone is the default layout

All updated surfaces should render correctly at phone widths without requiring a breakpoint to "fix" them.

Use breakpoints only to enhance layout density.

### Rule 2: No horizontal scrolling on core routes

No route in scope may horizontally overflow at phone widths.

### Rule 3: Primary actions stay reachable

The main action on each route must remain visible or clearly reachable without layout confusion.

### Rule 4: Dense surfaces need real mobile variants

Tables, split panes, and long filter/action bars must have intentional mobile representations.

### Rule 5: Async states follow the same layout contract

Loading, empty, and error states must use the same container and spacing system as the success state they replace.

## Device verification tiers

The implementation and review pass should explicitly check these viewport classes:

- `320px` narrow phone
- `375px` standard phone
- `390px` modern phone
- `430px` large phone
- `768px` tablet portrait
- laptop / desktop

## Current hotspot inventory

### Shell hotspot

- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)

Primary concerns:

- mobile header density
- nav sheet scanability
- account/theme/language controls inside mobile nav
- desktop sidebar offset leaking assumptions into page layout
- content padding consistency

### Dashboard hotspot

- [client/src/features/dashboard/dashboard-overview.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/dashboard/dashboard-overview.tsx)

Primary concerns:

- CTA group uses desktop-biased width assumptions
- stat/mode cards may compress footer actions awkwardly

### Quiz hotspot

- [client/src/components/quiz-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz-card.tsx)
- [client/src/features/quiz/quiz-session-shell.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/quiz-session-shell.tsx)

Primary concerns:

- fixed-height card on short screens
- control wrapping under narrow widths
- long text/example handling in result state

### Clusters hotspot

- [client/src/features/clusters/clusters-filter-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-filter-panel.tsx)
- [client/src/features/clusters/clusters-results-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-results-panel.tsx)

Primary concerns:

- desktop-style pseudo-table layout on phone
- filter density
- row action compression

### History hotspot

- [client/src/features/history/history-filter-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-filter-panel.tsx)
- [client/src/features/history/history-results-table.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-results-table.tsx)

Primary concerns:

- desktop-style grid header remains the base structure
- long metadata fields can become cramped

### Leaderboard hotspot

- [client/src/features/analytics/leaderboard-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-header.tsx)
- [client/src/features/analytics/leaderboard-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-panel.tsx)

Primary concerns:

- header control wrapping needs to stay consistent
- mobile and desktop list variants need stable information hierarchy

### Review hotspot

- [client/src/pages/review.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.tsx)
- [client/src/features/review/review-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-page-header.tsx)
- [client/src/features/review/review-bulk-actions.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-bulk-actions.tsx)
- [client/src/features/review/review-queue-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-queue-panel.tsx)
- [client/src/features/review/review-history-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-history-panel.tsx)

Primary concerns:

- queue/history split relies on wide-screen assumption
- row actions can crowd on phone
- bulk action controls need stronger mobile-first treatment

### Add vocabulary hotspot

- [client/src/features/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/create-vocabulary-draft-form.tsx)
- [client/src/components/review/vocabulary-draft-examples.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/vocabulary-draft-examples.tsx)

Primary concerns:

- two-column form grouping begins from a desktop mental model
- example rows need better phone ergonomics
- searchable controls may need width/overlay review

### Profile hotspot

- [client/src/features/profile/profile-form-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-form-card.tsx)

Primary concerns:

- profile summary and form need better small-screen spacing hierarchy
- save feedback and action row composition should remain clean

### Auth hotspot

- [client/src/pages/auth.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/auth.tsx)

Primary concerns:

- split-screen composition must collapse intentionally, not just mechanically

## Work phases

## Phase 1: Responsive audit and acceptance inventory

### Goal

Turn the current broad complaint into a concrete route-by-route issue map before refactoring.

### Tasks

- inspect every in-scope route at the target viewport tiers
- record issues by route and category:
  - horizontal overflow
  - clipped text
  - action wrap failure
  - table compression
  - split-pane compression
  - fixed-height content trapping
  - modal/drawer crowding
  - form density
- map each issue to a specific file and component owner

### Deliverable

A concrete remediation checklist attached to this plan or folded into the active task branch.

### Exit criteria

- every in-scope route has a known responsive risk inventory
- no implementation starts from guesswork

## Phase 2: Shell and global responsive foundation

### Goal

Make the app shell truly phone-first so page work is built on stable behavior.

### Primary files

- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
- related shared UI shell primitives if needed

### Tasks

- simplify mobile header spacing and hierarchy
- make the mobile navigation sheet scan-first
- ensure navigation remains primary and preferences/account remain secondary in the sheet
- audit language selector, theme toggle, and account actions for mobile crowding
- normalize page container padding so phone gets the base spacing model
- keep desktop sidebar offset logic isolated to desktop breakpoints only
- add/confirm safe handling for long labels, long emails, and long text in shell-owned UI

### Acceptance criteria

- mobile header never causes clipping or crowding at `320px`
- nav sheet opens to a readable, scroll-safe destination list
- shell-owned actions remain accessible without dominating first-screen nav content
- content container spacing is consistent across routes

## Phase 3: Shared mobile-first layout primitives

### Goal

Stop route-level inconsistency by standardizing responsive building blocks.

### Candidate shared patterns

- page header wrapper
- action group wrapper
- filter panel wrapper
- mobile card-list pattern for data surfaces
- responsive pagination/footer row
- form section wrapper

### Tasks

- identify repeated responsive patterns already present across headers and filters
- extract or normalize those patterns into shared conventions or shared components
- make the base style stacked/single-column, then enhance upward

### Acceptance criteria

- new responsive behavior is not duplicated differently across each route
- route fixes can reuse common patterns instead of introducing one-off classes

## Phase 4: Data-heavy learner surfaces

### Goal

Replace desktop-first table behavior with intentional mobile-friendly representations.

### Route group

- clusters
- history
- leaderboard
- word buckets if inconsistencies remain during implementation

### Tasks

- convert pseudo-table mobile layouts into stacked card/list layouts where needed
- keep table/grid presentation only when width supports readability
- ensure filter controls stack vertically by default
- ensure pagination uses full-width or clearly tappable buttons on phone
- confirm long text truncation is deliberate and not content loss without context

### Primary files

- [client/src/features/clusters/clusters-filter-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-filter-panel.tsx)
- [client/src/features/clusters/clusters-results-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/clusters/clusters-results-panel.tsx)
- [client/src/features/history/history-filter-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-filter-panel.tsx)
- [client/src/features/history/history-results-table.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-results-table.tsx)
- [client/src/features/analytics/leaderboard-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-header.tsx)
- [client/src/features/analytics/leaderboard-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/leaderboard-panel.tsx)
- [client/src/features/analytics/word-bucket-word-list.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/analytics/word-bucket-word-list.tsx)

### Acceptance criteria

- no data surface in this group horizontally overflows on phone
- filters remain readable and tappable at `320px`
- row actions stay reachable without layout collapse
- pagination remains obvious and thumb-friendly

## Phase 5: Reviewer surfaces and split-pane remediation

### Goal

Make the reviewer workflow usable on phones instead of merely compressed.

### Tasks

- keep queue/history stacked by default
- only enable side-by-side split when width justifies it
- rework row-level action groups so buttons do not crowd or clip
- keep bulk action notes and actions readable and reachable
- preserve active item context when moving between queue and history

### Primary files

- [client/src/pages/review.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.tsx)
- [client/src/features/review/review-page-header.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-page-header.tsx)
- [client/src/features/review/review-bulk-actions.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-bulk-actions.tsx)
- [client/src/features/review/review-queue-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-queue-panel.tsx)
- [client/src/features/review/review-history-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/review-history-panel.tsx)

### Acceptance criteria

- reviewer can inspect and action items at phone widths without horizontal scroll
- queue item actions wrap cleanly and remain tappable
- history content remains readable with long metadata and URLs
- stacked mobile layout still preserves clear queue/history mental model

## Phase 6: Form-heavy surfaces

### Goal

Make forms readable, scroll-safe, and completion-friendly on phones.

### Route group

- add vocabulary
- profile
- auth

### Tasks

- make all field groups single-column by default
- review searchable select and multi-select triggers/content for mobile width safety
- restructure example input blocks for phone readability
- ensure submit/save actions remain visually prominent after long content
- confirm auth layout collapses to a clean single-column experience

### Primary files

- [client/src/features/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/create-vocabulary-draft-form.tsx)
- [client/src/components/review/vocabulary-draft-examples.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/vocabulary-draft-examples.tsx)
- [client/src/features/profile/profile-form-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-form-card.tsx)
- [client/src/pages/auth.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/auth.tsx)
- related auth presentation panels if required by the implementation

### Acceptance criteria

- no input/control overflows on phone
- long forms remain easy to scan section by section
- submit/save actions remain reachable and visually clear
- auth page remains uncluttered on phone widths

## Phase 7: Learning-flow polish

### Goal

Tighten the learner-first screens where short-session phone usage matters most.

### Route group

- dashboard
- quiz

### Tasks

- remove phone-hostile CTA width assumptions in dashboard hero/actions
- ensure stat and mode cards maintain readable action/footer layout
- review quiz fixed-height treatment on short screens
- keep question, confidence controls, answers, and result state usable without trapped content
- confirm images/audio controls do not distort mobile flow

### Primary files

- [client/src/features/dashboard/dashboard-overview.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/dashboard/dashboard-overview.tsx)
- [client/src/components/quiz-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz-card.tsx)
- [client/src/features/quiz/quiz-session-shell.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/quiz-session-shell.tsx)

### Acceptance criteria

- dashboard primary CTA group stacks cleanly on phone
- quiz answer flow remains the dominant focus on phone
- no short-screen clipping or hidden primary controls during quiz flow

## Phase 8: Async state alignment

### Goal

Ensure loading/error/empty states do not break the mobile layout contract.

### Tasks

- audit `page-states` primitives and route-level state composition
- align state containers with success-state spacing and width
- ensure skeletons do not introduce wider-than-content layouts

### Primary files

- [client/src/components/ui/page-states.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/page-states.tsx)
- route-level state usages across in-scope pages

### Acceptance criteria

- no layout jump caused by state transitions
- loading and fallback surfaces are as mobile-safe as success surfaces

## Phase 9: Responsive regression coverage and QA

### Goal

Protect the refactor with targeted automated and manual checks.

### Tasks

- add focused responsive assertions for shell and representative route patterns
- expand existing partial coverage areas called out in the frontend coverage matrix
- run targeted route/component tests after each major phase
- perform manual viewport verification across the defined device tiers

### Coverage priorities

- shell header and mobile drawer
- stacked action groups
- filter panel stacking
- mobile card variants for table-like surfaces
- review queue/history stacking
- add-vocabulary example/form layout
- quiz control wrapping and short-screen behavior

### Acceptance criteria

- responsive regressions are covered on high-risk routes
- manual QA confirms no horizontal overflow and no broken primary flows in scope

## Route-by-route acceptance checklist

### Dashboard

- hero stacks vertically on phone
- CTA labels do not clip
- stat cards stay one-column at narrow widths
- mode card footer actions do not compress awkwardly

### Quiz

- answer buttons remain full-width or comfortably tappable
- confidence controls wrap cleanly
- result panel handles long answers/examples without clipping
- next-step CTA remains reachable

### Clusters

- filters stack cleanly
- results use a readable mobile list/card pattern
- action buttons do not shrink into unusable controls

### History

- filters stack cleanly
- attempts render readably on phone
- metadata remains understandable without horizontal scroll

### Leaderboard

- mobile entries preserve rank, learner identity, XP, streak, and accuracy clearly
- header window controls remain easy to toggle on phone

### Word buckets

- existing mobile/tablet behavior remains consistent with updated shared patterns
- no regression in list/pagination layout

### Review

- status selector and navigation actions stack safely
- queue and history stack by default
- bulk actions remain usable at narrow widths
- per-row actions remain tappable and legible

### Add vocabulary

- field groups stack by default
- example inputs are readable and removable without crowding
- searchable controls remain width-safe
- create action stays easy to reach

### Profile

- profile summary does not crowd fields
- fields remain single-column on phone
- save state and save action remain clear

### Auth

- brand/sign-in layout collapses intentionally to a clean phone layout
- sign-in CTA remains immediately understandable

## Risks and dependency notes

### Highest risk areas

- shell refactor causing route spacing regressions
- data-surface changes causing test failures because markup structure changes
- searchable/popover components requiring follow-on mobile treatment
- quiz fixed-height changes affecting perceived flow or animation behavior

### Dependencies

- shell work should land before broad route polishing
- shared pattern extraction should happen before repeated route-level fixes
- reviewer/data-surface work should happen before coverage lock-in for those routes

## Recommended execution order

1. audit and issue inventory
2. shell and global spacing
3. shared responsive patterns
4. clusters/history/leaderboard/word buckets
5. review workflow
6. add vocabulary/profile/auth
7. dashboard/quiz polish
8. async state alignment
9. regression coverage and manual QA

## Definition of done

This work is complete when all items below are true:

- no core route in scope horizontally overflows at phone widths
- primary actions remain visible or clearly reachable on phone
- desktop-first pseudo-table compression is removed from high-risk mobile surfaces
- split-pane reviewer flows stack intentionally on smaller widths
- form-heavy routes are single-column first
- loading, empty, and error states respect the same responsive layout contract as success states
- responsive regressions are covered for the highest-risk shell and route patterns

## Initial implementation target

Start with:

- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
- one shared header/action/filter pattern where duplication is currently highest

Reason:

This gives the route-level work a stable mobile-first foundation instead of forcing repeated cleanup later.
