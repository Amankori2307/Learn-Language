# Phase 14 - Design System Governance And Enforcement

## Objective

Define one canonical design system for the entire app and make adherence enforceable across shared primitives, feature surfaces, and route layouts on phone, tablet, laptop, and desktop widths.

## Why this phase exists

The repo already has theme-token groundwork, but it does not yet have one complete design-system contract that covers:

- benchmarked guidance from established design systems
- layout structure and responsive composition rules
- typography scale and content hierarchy
- spacing, sizing, density, and interaction patterns
- shared component states and variant ownership
- mobile and desktop behavior requirements for the same surface
- clear enforcement paths in tooling, review rules, and regression coverage

Without this phase, the app can still drift in predictable ways:

- page-level one-off layouts that bypass shared patterns
- inconsistent spacing, widths, and hierarchy between features
- responsive fixes that improve phone layouts while degrading desktop usability
- reusable components gaining local style exceptions instead of shared variants
- design-system rules existing as advice instead of a gated implementation contract

## Target outcome

By the end of this phase, the repo should have:

- a named app design system with clear ownership and scope
- one canonical design-system document in `documentation/architecture/`
- an explicit benchmark record showing which established design systems informed the contract and where this app intentionally diverges
- a defined foundation contract for tokens, breakpoints, layout, typography, spacing, radius, shadow, motion, and interaction states
- explicit responsive rules for mobile and desktop behavior on all high-value surfaces
- shared component ownership rules for primitives, composites, and feature wrappers
- an enforcement model that combines lintable rules, review checklists, route verification, and targeted tests
- backlog-tracked migration work for surfaces that still bypass the system

## Design-system contract to define

### Foundations

The canonical design system should define:

- the design-system identity, naming, and scope boundary for this app
- breakpoint model and intended layout behavior at each breakpoint
- spacing scale and allowed usage bands
- typography scale for page title, section title, body, helper, caption, and data-dense text
- radius, border, shadow, and surface-elevation semantics
- motion levels and when motion must be reduced or removed
- icon sizing, touch-target minimums, control heights, and dense-table allowances
- content-width and shell-width rules for reading, forms, dashboards, and data-heavy surfaces

### Layout and responsive behavior

The system should define explicit patterns for:

- app shell, nav, and content gutters
- single-column phone layouts
- tablet transition layouts
- desktop multi-column and split-pane layouts
- sticky header, footer, and action-bar behavior
- filter/action wrapping and overflow strategy
- data-table degradation into stacked cards or horizontal containment
- form grouping, label alignment, helper text placement, and error placement

### Components

The system should define:

- canonical variants, sizes, and states for shared primitives
- rules for when feature components may wrap shared primitives versus invent new styling
- empty, loading, error, success, warning, and destructive state composition
- overlay, dialog, sheet, popover, and drawer behavior across mobile and desktop
- CTA hierarchy rules so primary, secondary, and destructive actions stay consistent

### Enforcement

The system should define how compliance is enforced through:

- benchmark-backed rationale so new rules are anchored in known design-system practice rather than personal preference
- semantic-token and shared-variant requirements in code
- banned styling patterns and approved escape hatches
- automated lint or audit checks for raw palette use, one-off arbitrary values, and forbidden layout patterns
- PR review checklist items for responsive validation and shared-component reuse
- route and component regression coverage expectations
- explicit tracking of allowed exceptions and follow-up debt

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P14-001 | done | Produce a repo-wide design-system audit and responsive baseline | - | M | the current gaps across tokens, layouts, components, and responsive behavior are inventoried |
| P14-002 | done | Benchmark established design systems and extract the patterns worth adopting | P14-001 | M | the phase has an explicit inspiration baseline instead of ad hoc taste-based decisions |
| P14-003 | done | Define the app-specific design-system identity and canonical specification | P14-002 | L | one architecture doc defines the system in durable implementation terms |
| P14-004 | done | Define the responsive contract for phone, tablet, laptop, and desktop surfaces | P14-003 | M | the repo has explicit rules for layout adaptation instead of ad hoc breakpoints |
| P14-005 | done | Define component-governance and composition rules for shared primitives and feature wrappers | P14-003 | M | component ownership and allowed extension seams are explicit |
| P14-006 | done | Define the enforcement model in repo guidelines, checks, and review gates | P14-003,P14-004,P14-005 | M | compliance has concrete automated and human enforcement paths |
| P14-007 | done | Implement or extend automated detection for the highest-value design-system violations | P14-006 | L | `pnpm run lint` or an equivalent quality gate catches major styling-governance drift |
| P14-008 | done | Migrate the highest-risk shared and route surfaces that currently bypass the design system | P14-005,P14-006 | L | core app surfaces align with the new canonical system |
| P14-009 | done | Add regression coverage and completion criteria for ongoing enforcement | P14-007,P14-008 | M | tests, smoke checks, and review criteria protect the system against drift |

## Execution map

### P14-001 - Audit and baseline

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-001A | done | Inventory current shared primitives, feature wrappers, route shells, and page-level styling seams | - | the current design-system ownership map is explicit |
| P14-001B | done | Inventory hardcoded spacing, widths, typography, shadows, arbitrary values, and palette usage that bypass shared tokens | P14-001A | implementation drift is documented by category |
| P14-001C | done | Inventory responsive pain points on core phone and desktop surfaces | P14-001A | high-risk layout regressions are listed by route/surface |
| P14-001D | done | Inventory current async, empty, error, and destructive-state presentation patterns | P14-001A | state-surface inconsistencies are visible |

### P14-002 - External benchmark and inspiration baseline

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-002A | done | Select the established design systems to benchmark for foundations, responsiveness, accessibility, and component governance | P14-001 | the benchmark set is explicit and intentionally chosen |
| P14-002B | done | Extract transferable patterns for breakpoints, spacing, typography, density, and layout composition from the benchmark set | P14-002A | reusable external lessons are captured |
| P14-002C | done | Extract transferable patterns for component anatomy, states, overlays, and interaction hierarchy from the benchmark set | P14-002A | component-level inspiration is captured |
| P14-002D | done | Record the intentional differences between those systems and this app’s needs so the design system stays app-specific | P14-002B,P14-002C | copied rules and intentional divergences are clearly separated |

### P14-003 - Canonical design-system specification

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-003A | done | Choose and document the app-specific design-system name and the meaning of that identity | P14-002D | the system has one durable name instead of generic references |
| P14-003B | done | Define foundation tokens for spacing, typography, sizing, radius, border, shadow, elevation, and motion | P14-003A | a complete foundation contract exists |
| P14-003C | done | Define semantic layout primitives for shell, section, stack, cluster, pane, content width, and grid ownership | P14-003B | page composition rules are standardized |
| P14-003D | done | Define component anatomy, allowed variants, and state semantics for shared interactive primitives | P14-003B | shared component behavior is explicit |
| P14-003E | done | Publish the canonical design-system document and cross-link it from existing frontend/theme docs | P14-003C,P14-003D | there is one durable source of truth |

### P14-004 - Responsive contract

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-004A | done | Define breakpoint intent for phone, tablet, laptop, and desktop widths | P14-003E | each breakpoint has a role, not just a pixel cutoff |
| P14-004B | done | Define mobile rules for touch targets, vertical rhythm, stacked actions, drawers, forms, and tables | P14-004A | mobile constraints are implementation-ready |
| P14-004C | done | Define desktop rules for information density, multi-column layouts, sticky panels, hover affordances, and scanability | P14-004A | desktop quality is protected explicitly |
| P14-004D | done | Define how the same core surfaces adapt between mobile and desktop without losing primary actions or hierarchy | P14-004B,P14-004C | responsive behavior is described surface-by-surface |

### P14-005 - Component governance

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-005A | done | Classify components into foundation primitives, shared composites, and feature-owned wrappers | P14-003E | ownership boundaries are clear |
| P14-005B | done | Define the rule for when a new style need becomes a shared variant versus a feature-local exception | P14-005A | variant sprawl is controlled |
| P14-005C | done | Define state-surface composition for empty, loading, error, success, warning, and destructive flows | P14-005A | common UX states stay visually consistent |
| P14-005D | done | Define overlay behavior for dialog, sheet, drawer, and popover across phone and desktop | P14-004D,P14-005A | overlays adapt consistently by viewport |

### P14-006 - Enforcement model

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-006A | done | Update durable repo guidelines with design-system and responsive-governance rules | P14-003E,P14-004D,P14-005D | contributors have clear non-optional rules |
| P14-006B | done | Define the automated checks to add or extend for raw palette, arbitrary-value, and layout-governance violations | P14-006A | enforcement is scoped concretely for implementation |
| P14-006C | done | Define the review checklist for viewport verification, primitive reuse, and exception approval | P14-006A | human review expectations are explicit |
| P14-006D | done | Define the exception process, debt tracking format, and sunset rule for approved deviations | P14-006A | exceptions stop becoming permanent drift |

### P14-007 - Automated enforcement

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-007A | done | Extend repo checks to flag forbidden raw palette classes and non-token color usage in shared and feature UI | P14-006B | major color-governance drift is caught automatically |
| P14-007B | done | Extend repo checks to flag banned arbitrary spacing, width, radius, and shadow patterns where shared tokens exist | P14-006B | layout drift is harder to introduce silently |
| P14-007C | done | Add an allowlist mechanism for explicit short-term exceptions with expiration ownership | P14-006D | temporary escapes are visible and reviewable |

### P14-008 - Surface migration

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-008A | done | Migrate the app shell and top navigation to the canonical layout rules | P14-007A,P14-007B | the main shell becomes the reference implementation |
| P14-008B | done | Migrate high-risk dense surfaces such as review, quiz, analytics, and history to the responsive design-system rules | P14-008A | high-value routes no longer rely on one-off layout logic |
| P14-008C | done | Migrate forms, page states, and overlays that still bypass shared sizing and spacing rules | P14-008B | common interaction surfaces align with the system |

### P14-009 - Regression coverage

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P14-009A | done | Add targeted tests for shared variants, responsive shell behavior, and core state surfaces | P14-008C | representative design-system contracts are protected |
| P14-009B | done | Add or tighten smoke verification for at least one phone width and one desktop width on high-risk flows | P14-009A | responsive regressions are more likely to be caught before merge |
| P14-009C | done | Record completion criteria and remaining approved exceptions in canonical docs and active planning context | P14-009B | the phase closes with explicit enforcement continuity |

## Definition of ready

Do not start a major design-system implementation slice until:

- the target surface is classified as primitive, composite, or feature wrapper
- the relevant benchmark patterns and intentional divergences are known
- its responsive behavior is described for phone and desktop
- the shared token or variant seam is identified
- any needed lint or audit rule is known in advance
- required test or viewport verification for the slice is named

## Done-when

- a canonical design-system document exists and is linked from the frontend architecture docs
- guidelines define non-optional design-system and responsive rules
- the enforcement model includes both automated checks and review gates
- core app surfaces have an agreed migration order
- major deviations are either removed or tracked as explicit exceptions with owners

## Exit criteria

- [continuum-design-system.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/continuum-design-system.md) is the canonical design-system source of truth
- `pnpm run lint` includes design-system governance enforcement
- current design-system exceptions are reduced to zero; governance now passes without allowlisted UI drift
- remaining route/surface migration work stays visible in this phase file instead of becoming undocumented drift
