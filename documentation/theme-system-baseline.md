# Theme System Baseline

This document is the execution baseline for `P12-001`. It describes the current client theming model, what is already centralized, what still bypasses the design system, and the concrete migration seams required before the app can support named themes cleanly.

## Objective

Prepare the frontend for named multi-theme support without fragmenting styling ownership.

This baseline exists to prevent:

- adding a theme selector on top of inconsistent styling rules
- preserving hidden `light`/`dark` assumptions inside reusable components
- shipping a `minimal` theme that only changes parts of the app
- allowing pages/features to keep choosing colors and state styling directly

## Current theme topology

The client already has a partial theme system.

Primary entry points:

- [client/src/App.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/App.tsx)
  - wraps the app in `ThemeProvider` from `next-themes`
  - currently uses `attribute="class"` with `defaultTheme="dark"` and `enableSystem`
- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
  - defines global CSS variables in `:root`
  - defines a `.dark` override
  - applies base body/background treatment from those variables
- [tailwind.config.ts](/Users/aman/Projects/personal-projects/Learn-Language/tailwind.config.ts)
  - maps many Tailwind color names to CSS variables such as `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `accent`, `destructive`, `ring`, and sidebar/chart tokens

Current high-level assessment:

- the repo already has the right foundation for themeability
- most of the system is still built around a binary `light`/`dark` assumption
- many components already consume semantic tokens
- several high-visibility screens and feedback surfaces still bypass those tokens

## Shared primitive coverage

The repo already has a substantial shared primitive layer in `client/src/components/ui`.

Healthy examples:

- [client/src/components/ui/button.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/button.tsx)
- [client/src/components/ui/button-variants.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/button-variants.ts)
- [client/src/components/ui/card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/card.tsx)
- [client/src/components/ui/input.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/input.tsx)
- [client/src/components/ui/textarea.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/textarea.tsx)
- [client/src/components/ui/dialog.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/dialog.tsx)
- [client/src/components/ui/sheet.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/sheet.tsx)
- [client/src/components/ui/tabs.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/tabs.tsx)

What is already centralized well:

- button variants and sizes
- core card surface
- form field baseline styling
- most popover/dialog/dropdown/select surface styling
- most typography and surface colors through semantic variables

What is not fully centralized yet:

- status and feedback colors
- a consistent radius scale applied through semantic tokens rather than repeated Tailwind classes
- motion/shadow ownership as a first-class theme concern
- theme ownership for chart selectors and other non-component helpers

## Current compliance assessment

### Good current state

- route pages increasingly delegate to feature/view-model layers rather than building all UI inline
- many feature components compose shared `ui` primitives instead of hand-rolling controls
- the base theme already uses CSS variables, which is the right seam for future named themes

Representative examples:

- [client/src/pages/dashboard.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.tsx)
- [client/src/pages/profile.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/profile.tsx)
- [client/src/features/dashboard/dashboard-overview.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/dashboard/dashboard-overview.tsx)

### Main blockers to named themes

1. Some screens still hardcode product colors.
2. Some feedback/status surfaces still use raw green/red/rose/emerald classes.
3. Some reusable utilities still assume only `.dark`.
4. Some theme-aware helpers are typed only for `light` and `dark`.
5. Radius/shadow/motion choices are repeated directly in components instead of owned as theme-level tokens.

## Hardcoded visual outliers

### Page-level outliers

- [client/src/pages/not-found.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/not-found.tsx)
  - uses `bg-gray-50`, `text-red-500`, `text-gray-900`, `text-gray-500`, and a one-off `shadow-xl`
  - should be rewritten against shared surface and semantic status tokens

### Feature-level outliers

- [client/src/features/profile/profile-form-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/profile/profile-form-card.tsx)
  - save success/error copy uses `text-red-600` and `text-green-600`
- [client/src/components/quiz/quiz-feedback-panel.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz/quiz-feedback-panel.tsx)
  - correctness state uses raw emerald/rose/green values plus `dark:` branches
- [client/src/features/history/history-results-table.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/history/history-results-table.tsx)
  - correct-attempt badges/buttons use direct emerald classes
- [client/src/features/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/review/create-vocabulary-draft-form.tsx)
  - form error copy uses direct red text classes

### Shared-state outliers

- [client/src/components/ui/page-states.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/page-states.tsx)
  - the error tone is hardcoded with `border-red-200 bg-red-50 text-red-700 text-red-600`
- [client/src/components/ui/toast.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/toast.tsx)
  - destructive styling still contains red-specific state classes
- [client/src/components/ui/alert.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/alert.tsx)
  - still contains a `dark:` branch in destructive styling

## Light/dark coupling points

These files directly assume the app only has `light` and `dark`.

- [client/src/App.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/App.tsx)
  - the provider uses `defaultTheme="dark"` and does not yet express named themes
- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
  - the toggle logic flips only between `"dark"` and `"light"`
- [client/src/components/ui/chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx)
  - chart config typing and selector generation are restricted to `light` and `dark`
- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
  - token overrides are defined only for `:root` and `.dark`

## Global utility coupling points

The following utilities still encode specific visual assumptions that should become theme-safe:

- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
  - `.glass-card` hardcodes white/black overlays and `.dark`
  - `body` background image treatment is globally fixed rather than theme-owned
- [client/src/components/ui/avatar.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/avatar.tsx)
  - the overlay border uses direct black/white alpha values with a `dark:` branch

## Radius, shadow, and motion ownership gaps

Current state:

- many components use repeated rounded utilities such as `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`, and custom arbitrary radii such as `rounded-[1rem]` and `rounded-[1.75rem]`
- shadows are repeated directly with `shadow-sm`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, and color-tinted shadow utilities
- motion is applied ad hoc with direct `transition`, `transition-all`, `duration-150`, `duration-200`, `duration-300`, `duration-500`, and bespoke animation behavior

Implication:

- the app can change colors at the theme level more easily than it can change shape/depth/motion at the theme level
- a true `minimal` theme will need non-color tokens, not just alternate HSL values

## Theme-safe areas that can be reused

The migration does not start from zero. These parts already align reasonably well with the desired direction:

- token-backed Tailwind colors in [tailwind.config.ts](/Users/aman/Projects/personal-projects/Learn-Language/tailwind.config.ts)
- shared button ownership in [client/src/components/ui/button-variants.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/button-variants.ts)
- shared card ownership in [client/src/components/ui/card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/card.tsx)
- shared field ownership in [client/src/components/ui/input.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/input.tsx) and [client/src/components/ui/textarea.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/textarea.tsx)
- route-to-feature separation already established across much of `client/src/pages` and `client/src/features`

## Target migration seams

The next implementation tasks should use these seams:

### Theme contract seam

- new owned module for supported-theme enum and metadata
- one app-level default theme constant
- explicit mapping between theme names and CSS selectors/classes

### Global token seam

- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
  - convert the current visual style into an explicit named theme
  - add `minimal`
  - add semantic status tokens
  - add non-color tokens for radius/shadow/motion where needed

### Primitive migration seam

- `client/src/components/ui/*`
  - remove raw status colors and raw `dark:` assumptions from reusable pieces first

### Feature cleanup seam

- migrate outlier pages/features only after primitives and tokens are ready
- prioritize `not-found`, page states, quiz feedback, profile feedback, review form errors, and history correctness styling

## Recommended execution order

1. define the canonical theme contract
2. add supported-theme enum/config/default-theme ownership
3. formalize the current theme and add `minimal`
4. migrate shared primitives
5. standardize semantic status styling
6. migrate page/feature outliers
7. extend chart theming
8. add regression coverage

## Readiness conclusion

The client is already close enough that named theming is a practical refactor, not a rewrite.

However, the current state is only partially extracted:

- base colors and many primitives are centralized
- status semantics are not centralized
- some outlier screens still bypass the design system
- `light`/`dark` assumptions are still embedded in key seams

Phase 12 should therefore treat multi-theme support as a design-system extraction problem first and a theme-picker problem later.
