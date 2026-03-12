# Theme System

This document is the canonical source for named-theme behavior and theme-safe component expectations.

Theme tokens are one foundation layer of the broader [Continuum Design System](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/continuum-design-system.md).

## Current theme model

Theme ownership lives in:

- [client/src/theme/app-theme.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.ts)
- [client/src/theme/app-theme-provider.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme-provider.tsx)
- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
- [client/src/components/ui/chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx)

Implemented themes:

- `dark`
- `minimal`

Planned but not yet shipped:

- `warm`
- `midnight`
- `editorial`
- `playful`
- `high-contrast`

## Contract

Components must consume semantic tokens and shared variants, not raw palette choices.

Required token groups:

- foundation surface and text tokens
- interactive tokens such as `primary`, `secondary`, `accent`, `muted`, and `destructive`
- status tokens for success, warning, error, and info
- chart tokens
- radius tokens
- shadow tokens
- overlay and background tokens
- motion tokens

## Current implementation notes

- `dark` is the user-facing label for app theme id `current`, which maps to provider theme `dark`
- `minimal` maps to provider theme `minimal`
- system theme detection is disabled intentionally
- chart theming already uses the implemented theme registry instead of a `light`/`dark` assumption

## Rules contributors must follow

- new reusable UI must be theme-aware by default
- prefer semantic classes such as `bg-background`, `text-foreground`, and `border-border`
- add new reusable visual states through shared tokens or variants instead of one-off local styling
- a planned theme is not live until its provider mapping, selector, and token set all exist
- token decisions should stay aligned with the Continuum spacing, layout, responsive, and component-governance contract

## Remaining practical debt

- some feature surfaces still carry one-off emphasis styling that should move toward shared variants
- theme switching is shell-owned; there is not yet a dedicated end-user settings surface
