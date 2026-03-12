# Theme System Baseline

This document describes the current named-theme implementation in the client and the remaining constraints contributors need to preserve.

## Current topology

The app uses a hybrid Next app-router shell plus a client-side SPA. Theme ownership lives in:

- [app/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/layout.tsx)
- [client/src/App.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/App.tsx)
- [client/src/theme/app-theme.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.ts)
- [client/src/theme/app-theme-provider.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme-provider.tsx)
- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
- [client/src/components/layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx)
- [client/src/components/ui/chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx)

## Implemented theme model

- Canonical theme IDs live in [app-theme.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.ts).
- Implemented themes today:
  - `current`
  - `minimal`
- Planned registry entries already exist for:
  - `warm`
  - `midnight`
  - `editorial`
  - `playful`
  - `high-contrast`
- `current` maps to provider theme `dark` and selector `.dark`.
- `minimal` maps to provider theme `minimal` and selector `.minimal`.
- The default theme is the `current` theme via `getDefaultProviderTheme()`.
- System theme detection is intentionally disabled; the app only rotates through explicitly supported product themes.

## Token coverage

The current CSS token layer in [index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css) already defines both implemented themes with:

- semantic foundation tokens such as `--background`, `--foreground`, `--card`, `--popover`, `--sidebar`, `--border`, and `--ring`
- semantic interactive tokens such as `--primary`, `--secondary`, `--accent`, `--muted`, and `--destructive`
- status tokens for success, warning, error, and info states
- chart tokens `--chart-1` through `--chart-5`
- radius tokens `--radius-xs` through `--radius-pill`
- shadow tokens `--shadow-xs` through `--shadow-accent`
- overlay, glass, gradient, and motion tokens

The shipped themes differ in more than color:

- `current` is denser, darker, and more elevated
- `minimal` softens borders, reduces shadow depth, tightens radii, and uses a light surface system

## Current consumers

Theme-aware behavior is already implemented in the main reusable seams:

- [app-theme-provider.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme-provider.tsx) registers the implemented provider themes with `next-themes`
- [layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/layout.tsx) cycles only through implemented themes and derives product theme IDs from the resolved provider theme
- [chart.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/ui/chart.tsx) no longer assumes only `light` and `dark`; it generates chart styles from the implemented theme registry
- shared UI primitives and state surfaces consume semantic classes and token-backed utilities rather than hardcoded palette branches in most cases

## Constraints that remain true

- New reusable UI must stay theme-safe by default.
- New themes must be added through [app-theme.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/theme/app-theme.ts) and [index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css), not ad hoc component logic.
- Feature code should prefer semantic classes such as `bg-background`, `text-foreground`, `border-border`, and shared status utilities instead of raw palette classes.
- A planned theme is not considered live until its provider name, selector, and token set are all implemented.

## Remaining practical debt

- Some feature-level surfaces still contain one-off layout styling or palette-tinted emphasis that should continue moving toward shared variants.
- Theme selection is shell-owned; there is not yet a dedicated settings surface for choosing among future named themes.
- The public marketing pages currently rely on the shared root stylesheet but do not expose per-page theme selection.
