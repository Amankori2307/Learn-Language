# Theme Contract

This document is the execution decision record for `P12-002`. It defines the canonical theming interface the client will use for named theme support. All future theme implementations must satisfy this contract before they are considered complete.

## Objective

Create one stable, semantic theme contract so components do not choose their own colors, status treatments, depth, shape, or motion rules.

This contract is the prerequisite for:

- a one-line default-theme switch in code
- preserving the current shipped theme while adding `minimal`
- adding future themes without reworking component logic
- eventually exposing theme selection in the UI

## Contract rules

### 1. Components consume semantics, not palette values

Components must read theme intent such as:

- `card`
- `muted`
- `status-success`
- `surface-elevated`
- `interactive-primary`

They must not choose raw color families such as:

- emerald
- rose
- red
- gray
- zinc

### 2. Theme changes must affect more than colors

A theme is allowed to change:

- color system
- status treatment
- shape/radius feel
- shadow/depth feel
- background/overlay feel
- transition emphasis
- optional typography treatment

This is required so `minimal` can be meaningfully different from the current theme.

### 3. Shared primitives are the first consumers

The contract must be adopted in this order:

1. global CSS token definitions
2. shared `components/ui` primitives
3. shared state surfaces
4. feature components
5. page-level outliers

## Canonical token groups

Each shipped theme must define the following token groups.

## 1. Foundation color tokens

These are the required base application tokens.

| Token | Purpose |
| ----- | ------- |
| `--background` | app background |
| `--foreground` | default text color |
| `--card` | primary surface background |
| `--card-foreground` | text on cards |
| `--card-border` | default card border |
| `--popover` | floating surface background |
| `--popover-foreground` | text on floating surfaces |
| `--popover-border` | floating surface border |
| `--sidebar` | sidebar background |
| `--sidebar-foreground` | sidebar text |
| `--sidebar-border` | sidebar border |
| `--input` | input border/fill support |
| `--border` | general border color |
| `--ring` | focus ring color |

These are already partially represented in the current Tailwind configuration and should remain the primary base layer.

## 2. Interactive semantic tokens

These define reusable interactive intent rather than one-off button colors.

| Token | Purpose |
| ----- | ------- |
| `--primary` | primary action/signal background |
| `--primary-foreground` | text/icon on primary |
| `--primary-border` | primary border when applicable |
| `--secondary` | secondary surface/action background |
| `--secondary-foreground` | text/icon on secondary |
| `--secondary-border` | secondary border |
| `--accent` | highlighted interactive accent |
| `--accent-foreground` | text/icon on accent |
| `--accent-border` | accent border |
| `--muted` | low-emphasis surface |
| `--muted-foreground` | low-emphasis text |
| `--muted-border` | low-emphasis border |
| `--destructive` | destructive action background |
| `--destructive-foreground` | text/icon on destructive |
| `--destructive-border` | destructive border |

## 3. Status semantic tokens

These replace direct green/yellow/red/blue class usage in feedback surfaces.

Each status should provide surface, foreground, border, and emphasis tokens.

| Token | Purpose |
| ----- | ------- |
| `--status-success` | success surface/background |
| `--status-success-foreground` | success text/icon |
| `--status-success-border` | success border |
| `--status-success-emphasis` | stronger success accent/glow/badge tone |
| `--status-warning` | warning surface/background |
| `--status-warning-foreground` | warning text/icon |
| `--status-warning-border` | warning border |
| `--status-warning-emphasis` | stronger warning accent |
| `--status-error` | error surface/background |
| `--status-error-foreground` | error text/icon |
| `--status-error-border` | error border |
| `--status-error-emphasis` | stronger error accent |
| `--status-info` | informational surface/background |
| `--status-info-foreground` | informational text/icon |
| `--status-info-border` | informational border |
| `--status-info-emphasis` | stronger informational accent |

Usage rules:

- page states, alerts, badges, quiz correctness messaging, save messages, and review feedback must use these semantics
- no feature component should pick its own red/green family directly after migration

## 4. Chart and data-visualization tokens

Charts need a stable theme contract rather than a hardcoded `light`/`dark` map.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--chart-1` | categorical series 1 |
| `--chart-2` | categorical series 2 |
| `--chart-3` | categorical series 3 |
| `--chart-4` | categorical series 4 |
| `--chart-5` | categorical series 5 |

Named-theme contract rule:

- chart helpers must map series colors by theme key, not by the assumption that only `light` and `dark` exist

## 5. Shape tokens

Themes must be able to change visual sharpness/softness consistently.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--radius-xs` | tight chip/control radius |
| `--radius-sm` | small field/button radius |
| `--radius-md` | standard surface radius |
| `--radius-lg` | larger panel/dialog radius |
| `--radius-xl` | hero/feature surface radius |
| `--radius-pill` | pill/full rounded treatment |

Adoption rules:

- shared primitives should progressively stop hardcoding multiple `rounded-*` values when those can be expressed through component variants or token-backed utility rules
- arbitrary radii should be treated as debt unless they are intentional, documented exceptions

## 6. Border and stroke tokens

Themes must define not only border color but also visual border weight/emphasis.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--border-strong` | stronger stroke for emphasized surfaces |
| `--border-soft` | quieter stroke for subtle grouping |
| `--border-contrast` | highest-contrast border for active states or separators |

These may be aliases of existing border values in simpler themes, but the contract should reserve them so themes like `minimal` can flatten or soften borders deliberately.

## 7. Shadow and depth tokens

Themes must define surface depth in a reusable way.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--shadow-xs` | smallest elevation |
| `--shadow-sm` | default small surface elevation |
| `--shadow-md` | medium surface elevation |
| `--shadow-lg` | dialog/card emphasis |
| `--shadow-xl` | hero/high-emphasis elevation |
| `--shadow-accent` | optional tinted emphasis shadow/glow |

Usage rules:

- button, card, dialog, toast, and hero surfaces should use semantic shadow classes/variants instead of hand-picking different `shadow-*` utilities per feature
- `minimal` may intentionally collapse many of these to softer or nearly-flat values

## 8. Background and overlay tokens

Themes may vary their atmosphere through surface layering and background treatment.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--app-gradient-start` | top/background atmosphere start |
| `--app-gradient-end` | top/background atmosphere end |
| `--surface-glass` | translucent elevated surface fill |
| `--surface-glass-border` | translucent elevated surface border |
| `--overlay-backdrop` | modal/sheet backdrop color |

Usage rules:

- global body background treatment must become theme-owned
- utility classes such as `.glass-card` must stop hardcoding white/black overlays

## 9. Motion tokens

Themes must be able to tune perceived energy and smoothness.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--motion-fast` | quick state transitions |
| `--motion-base` | default transition duration |
| `--motion-slow` | emphasized transition duration |
| `--ease-standard` | default easing |
| `--ease-emphasized` | stronger/elevated easing |

Usage rules:

- reusable components should prefer these values for hover/focus/surface transitions where practical
- feature components should not introduce arbitrary duration ladders unless the motion is feature-specific

## 10. Typography tokens

Phase 12 will keep typography themable, but scoped.

Required tokens:

| Token | Purpose |
| ----- | ------- |
| `--font-sans` | primary UI/body font |
| `--font-serif` | optional editorial/support font |
| `--font-mono` | technical/data font |
| `--font-display` | optional display heading font |

Phase-12 typography rule:

- the current shipped theme and `minimal` may share the same base fonts initially
- future themes may differ in `--font-display` or heading treatment without requiring component rewrites

## Required shipped themes in this phase

Phase 12 must ship:

- the current visual style as an explicitly named theme
- `minimal`

Phase 12 may declare but not implement yet:

- `warm`
- `midnight`
- `editorial`
- `playful`
- `highContrast`

Rule:

- unimplemented themes may exist in enum/config metadata
- only implemented themes may be selectable by default or by future UI controls

## Compatibility strategy

### Current-theme preservation

The current shipped look should remain the visual baseline after the contract is introduced.

This means:

- existing CSS variables should be mapped into the new contract rather than replaced blindly
- current button/card/input behavior should stay visually recognizable
- regression checks should compare the current-theme render before and after contract adoption

### Minimal-theme behavior

`minimal` should differ intentionally in at least these dimensions:

- flatter or softer shadows
- tighter and more restrained accent usage
- reduced background theatrics
- slightly sharper or cleaner shape language
- calmer motion

## Next implementation seams

`P12-003` should implement:

- supported-theme enum
- theme metadata/config
- default theme seam
- provider wiring ready for named themes

`P12-004` should implement:

- current theme formalization against this contract
- `minimal` token set
- verification that both shipped themes satisfy the full contract

## Readiness conclusion

The contract is intentionally broader than the app’s current token surface because the current token surface is not sufficient for true multi-theme support.

From this point forward:

- no new reusable component should introduce raw palette-specific styling if a semantic token fits
- status styling should migrate to the new status contract
- light/dark-only assumptions should be treated as transition debt unless they are part of a deliberate compatibility seam
