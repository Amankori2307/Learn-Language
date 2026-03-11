# Phase 12 - Theme System and Design Token Extraction

## Goal

Make the client app ready for named multi-theme support by finishing design-token extraction, formalizing theme ownership in code, preserving the current shipped visual style as an explicit theme, and adding a new `minimal` theme without allowing pages/features to bypass the shared design system.

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P12-001 | done | Produce a frontend theming baseline covering current token usage, shared primitive coverage, hardcoded style violations, and light/dark coupling points | - | M | the repo has a concrete inventory of what already follows the design system and what blocks named themes |
| P12-002 | done | Define the canonical theme contract for colors, status semantics, typography, radius, shadows, gradients, and motion | P12-001 | M | every reusable surface can read from one agreed token interface rather than ad hoc classes |
| P12-003 | done | Introduce named theme ownership in code with a supported-theme enum, metadata, and one-line default theme selection | P12-002 | S | theme support is explicit in code and the app default can be changed from one seam |
| P12-004 | todo | Convert the current shipped visual style into an explicit named theme and add a new minimal theme | P12-003 | M | the current look is preserved as a named theme and a complete `minimal` theme exists beside it |
| P12-005 | todo | Refactor shared UI primitives to depend only on semantic tokens rather than hardcoded colors or dark-mode-only branches | P12-004 | L | buttons, cards, inputs, overlays, states, and shared surfaces inherit theme changes consistently |
| P12-006 | todo | Standardize semantic status styling for success, warning, error, and info states across shared and feature components | P12-005 | M | no reusable state surface relies on raw green/red/rose/emerald classes directly |
| P12-007 | todo | Remove remaining page and feature styling outliers that bypass the design system and migrate them to shared theme-safe primitives | P12-006 | L | representative pages/features no longer hardcode product styling outside approved tokens/variants |
| P12-008 | todo | Extend chart theming and theme-aware utilities to support named themes beyond light and dark | P12-005 | M | charts and theme-dependent helpers work with the new named theme model |
| P12-009 | todo | Add regression coverage and verification for theme-safe primitives, the default theme seam, and the new minimal theme | P12-007,P12-008 | M | tests and smoke checks protect the theme system against drift and missing-token regressions |

## Micro-task execution map

The top-level tasks above are the phase gates. Actual execution should happen in smaller sub-steps. A top-level task is only `done` after all of its micro-tasks are `done`.

### P12-001 - Theming baseline audit

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-001A | done | Inventory the existing global CSS variables, theme classes, and `next-themes` configuration currently used by the client | - | the current theme entry points and token sources are explicitly listed |
| P12-001B | done | Inventory which shared `components/ui` primitives already use semantic tokens and which still contain hardcoded visual assumptions | P12-001A | primitive-level compliance and gaps are documented |
| P12-001C | done | Inventory pages/features that still hardcode colors, radii, shadows, gradients, or `dark:` branches outside shared primitives | P12-001B | all obvious theming violations are listed by file |
| P12-001D | done | Inventory status/feedback surfaces that use raw success/error colors instead of semantic state tokens | P12-001C | all state-color violations are identified |
| P12-001E | done | Inventory theme-coupled utilities such as chart selectors, helper classes, and global utility classes that assume only light/dark | P12-001D | non-component theme coupling points are documented |

### P12-002 - Canonical theme contract

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-002A | done | Define the required base semantic color tokens for app chrome, surfaces, text, borders, inputs, rings, and interactive accents | P12-001E | one approved base token contract exists |
| P12-002B | done | Define semantic status tokens for success, warning, error, and info surfaces, text, borders, and emphasis accents | P12-002A | feedback states no longer need raw color choices |
| P12-002C | done | Define non-color tokens for radius, border weight, shadows, gradients, and overlay/backdrop treatment | P12-002B | non-color styling can vary by theme without component rewrites |
| P12-002D | done | Define motion tokens covering transition duration, easing, and emphasis levels for hover/focus/surface motion | P12-002C | themes can tune motion consistently from shared values |
| P12-002E | done | Define typography ownership for theme-sensitive fonts or heading treatments and decide whether fonts are part of phase one or deferred | P12-002D | typography expectations are explicit and scoped |

### P12-003 - Named theme ownership in code

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-003A | done | Create a canonical supported-theme enum including the current theme, `minimal`, and placeholder values for future themes | P12-002E | supported theme names exist in one owned location |
| P12-003B | done | Create a theme metadata/config module that maps enum values to theme keys, labels, and implementation availability | P12-003A | the app can distinguish shipped themes from future placeholders cleanly |
| P12-003C | done | Add a single app-level default theme constant/config seam that controls the active default theme | P12-003B | changing one line changes the default app theme |
| P12-003D | done | Refactor the theme-provider setup to accept the named theme model without breaking current app boot behavior | P12-003C | provider wiring is ready for named themes |

### P12-004 - Existing theme formalization and minimal theme

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-004A | todo | Move the current shipped visual token set out of anonymous base usage into an explicit named theme definition | P12-003D | the current theme is selectable and named |
| P12-004B | todo | Add a complete `minimal` theme token set for base colors, surfaces, borders, accents, and typography-related tokens in scope | P12-004A | the minimal theme has no missing required tokens |
| P12-004C | todo | Add `minimal` values for radius, shadows, gradient/background treatment, and motion tokens | P12-004B | minimal changes more than just colors |
| P12-004D | todo | Verify the app renders with both the current theme and `minimal` theme without broken unreadable surfaces | P12-004C | both themes are visually functional |

### P12-005 - Shared primitive migration

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-005A | todo | Refactor button variants to rely only on semantic theme tokens and shared state variants | P12-004D | buttons no longer embed raw theme assumptions |
| P12-005B | todo | Refactor card, alert, badge, input, textarea, select, and table primitives to consume the canonical token contract | P12-005A | core content surfaces inherit theme changes consistently |
| P12-005C | todo | Refactor dialog, sheet, popover, tooltip, toast, and overlay primitives to use theme-safe surface and backdrop tokens | P12-005B | overlay components behave consistently across themes |
| P12-005D | todo | Refactor shared utility classes in global CSS that currently hardcode white/black or dark-specific behavior | P12-005C | global utilities are theme-safe |
| P12-005E | todo | Remove primitive-level `dark:` branches where semantic tokens can express the same intent | P12-005D | primitives are no longer locked to two-theme logic |

### P12-006 - Semantic status styling

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-006A | todo | Add status token usage to shared page-state primitives and any reusable alert/message surfaces | P12-005E | shared state surfaces are theme-safe |
| P12-006B | todo | Update toast and alert destructive/error handling to consume semantic status tokens instead of raw red values | P12-006A | destructive state styling is centralized |
| P12-006C | todo | Update quiz/review/profile/shared feedback surfaces that currently use raw success/error colors to use semantic status variants | P12-006B | feature feedback no longer hardcodes state colors |
| P12-006D | todo | Verify semantic status styling remains readable in both the current theme and `minimal` theme | P12-006C | state surfaces remain legible after migration |

### P12-007 - Page and feature outlier cleanup

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-007A | todo | Migrate obvious outlier screens such as not-found and any remaining one-off empty/error states to shared surfaces and semantic tokens | P12-006D | app-level outliers stop bypassing the design system |
| P12-007B | todo | Migrate feature components with raw product styling, starting with quiz feedback and profile save status messaging | P12-007A | known high-visibility feature outliers are theme-safe |
| P12-007C | todo | Extract repeated page-level surface patterns into shared variants or feature primitives where the same styling repeats materially | P12-007B | repeated styling is centralized rather than copied |
| P12-007D | todo | Run a final search pass for hardcoded color/style violations and clear or explicitly defer the remainder | P12-007C | remaining debt is either removed or documented |

### P12-008 - Chart and utility theme support

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-008A | todo | Refactor chart theme selector ownership so chart color mappings can target named themes rather than only `light` and `dark` | P12-005E | chart theming is compatible with the new theme model |
| P12-008B | todo | Update chart config types and any helper callers to align with the named theme contract | P12-008A | chart caller APIs are coherent |
| P12-008C | todo | Verify chart rendering remains stable under the current theme and `minimal` theme | P12-008B | chart visuals do not regress |

### P12-009 - Regression coverage and verification

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P12-009A | todo | Add tests for the theme enum/config/default-theme seam | P12-007D,P12-008C | theme ownership is covered by tests |
| P12-009B | todo | Add or update shared primitive tests for representative theme-safe class output and state variants | P12-009A | primitive regressions are easier to catch |
| P12-009C | todo | Add targeted feature tests for migrated outliers such as quiz feedback, page states, and profile feedback surfaces | P12-009B | high-risk migrated surfaces are covered |
| P12-009D | todo | Run the impacted frontend test suites and document verification results and any deferred debt | P12-009C | the phase has explicit verification evidence |

## Sequencing guardrails

### What must not happen early

- Do not add named theme values in code before the theme contract exists.
- Do not add a UI theme picker before the named theme model and default-theme seam are stable.
- Do not migrate feature pages before shared primitives and semantic status tokens are ready.
- Do not preserve `dark:`-only logic inside reusable components if the same intent can be expressed through semantic tokens.
- Do not add future theme token sets beyond `minimal` in this phase unless they are fully implemented and verified.

### Recommended implementation slices

1. theming baseline and decision record
2. theme enum/config/default seam
3. current theme formalization plus `minimal`
4. shared primitive token migration
5. semantic status migration
6. page/feature outlier cleanup
7. chart theme extension
8. tests and verification

## Definition of readiness

Do not start a top-level implementation task until:

- its dependencies are `done`
- the relevant baseline or decision record exists
- the target files and migration seams are listed
- the expected tests for the slice are named in advance
- compatibility expectations are explicit for current-theme behavior

## Per-slice checklist

For each micro-task implementation slice, record:

- target files
- change seam
- compatibility strategy
- risk notes
- acceptance checks
- tests to add or update
- follow-up debt explicitly deferred
