# Continuum Design System

This document is the canonical design-system contract for the app.

`Continuum` is the shared design-system name for this repository. The name reflects the product requirement that the same interface language must scale cleanly across a continuum of screen sizes rather than being designed for one breakpoint and patched later.

## Why Continuum exists

The app already had theme tokens and a growing shared component layer, but it still needed one durable contract for:

- layout composition
- responsive behavior from phone through desktop
- typography, spacing, sizing, radius, shadow, and motion rules
- component ownership and extension rules
- enforcement in lint, review, and regression coverage

Continuum owns those rules.

## External inspiration baseline

Continuum is app-specific, but it is intentionally informed by established systems:

- [Material Design 3](https://m3.material.io/)
  - strong adaptive layout guidance
  - clear emphasis on component states and accessibility
- [IBM Carbon](https://carbondesignsystem.com/)
  - disciplined spacing and grid thinking
  - strong density and data-surface conventions
- [Atlassian Design System](https://atlassian.design/)
  - practical primitives, layout composition, and product-scale governance
- [Shopify Polaris](https://shopify.dev/docs/apps/design/polaris)
  - strong operational admin-surface patterns, action hierarchy, and content clarity

Continuum does not copy those systems wholesale. It borrows the patterns that fit a text-first learning product and rejects the parts that would add enterprise-heavy ceremony or visual noise.

## Product-specific design stance

Continuum is optimized for a text-first language-learning product:

- reading and recall come before decorative density
- actions should stay obvious on mobile and desktop
- dense learning and analytics surfaces should remain scannable without looking like a generic dashboard template
- responsive behavior should preserve meaning, not just remove columns
- theme changes should not require component rewrites

Continuum applies to both route systems in the repository:

- authenticated SPA surfaces under `client/src/*`
- public Next.js marketing and discovery routes under `app/*`

## Foundation contract

### Breakpoint model

Continuum uses the existing Tailwind breakpoint system already present in the app:

- phone: default styles below `sm`
- tablet: `sm` through below `lg`
- laptop: `lg` through below `xl`
- desktop: `xl` and above

Rules:

- default styles must produce a complete phone layout
- `sm` may introduce extra width, wrapped control rows, or modest multi-column grouping
- `lg` may introduce persistent side-by-side panes or richer dashboard density
- `xl` is the point where broader information-dense desktop arrangements are expected
- a route is incomplete if its mobile behavior works but its laptop or desktop layout becomes weaker than before

### Typography

Continuum typography is token-led, not page-led.

Current font ownership:

- display and primary sans: `Outfit`
- long-form support and script-safe companion usage: `Noto Sans`

Hierarchy rules:

- page title: use a single clear H1 per route
- section title: use H2/H3 hierarchy consistently instead of visual-only bold text
- helper copy: prefer muted text rather than lower-contrast arbitrary colors
- data-dense labels: use small text sparingly and keep them readable on phone widths
- transliteration, helper text, and metadata should look secondary without becoming low-contrast

### Spacing and sizing

Continuum expects spacing decisions to come from a repeatable scale, not local guesswork.

Rules:

- prefer standard Tailwind spacing tokens first
- use CSS variable tokens when a reusable size needs to be theme-owned
- arbitrary width, height, padding, margin, gap, or radius values are a last resort and require an explicit allowlisted exception if they cannot be replaced
- repeated “almost the same” spacing values across features are a signal to create a shared primitive or token

### Radius, border, shadow, motion

Current theme token ownership lives in:

- [client/src/index.css](/Users/aman/Projects/personal-projects/Learn-Language/client/src/index.css)
- [theme-system.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/theme-system.md)

Rules:

- use the shared radius variables before inventing local rounded values
- use semantic border tokens such as `border-border`, `border-card-border`, and status-border tokens
- use shared shadow variables before introducing local shadow recipes
- motion should communicate hierarchy or state, not decorate every interaction
- mobile should avoid motion that slows task completion or competes with reading

## Layout primitives

Continuum defines these conceptual layout primitives for the app:

- `AppShell`
  - authenticated navigation, global actions, theme switcher, language switcher, and content frame
- `PageFrame`
  - route-level container that sets maximum readable width, vertical rhythm, and action alignment
- `SectionStack`
  - a vertically spaced stack of related sections using one shared rhythm
- `ActionCluster`
  - a row or wrapped group of related controls that keeps primary actions visible across breakpoints
- `PaneLayout`
  - a two-pane or split layout for dense surfaces such as quiz, review, and analytics
- `DataSurface`
  - tables, ranked lists, summaries, and result panels that need consistent density and overflow behavior
- `StateSurface`
  - loading, empty, success, warning, and error containers that must inherit the same width and spacing rules as the success state
- `PublicPageShell`
  - public-site page wrapper that keeps discovery routes on the same spacing, width, and footer system
- `PublicIntro`
  - public-site heading pattern with breadcrumb, eyebrow, title, and supporting copy
- `PublicCard`
  - reusable marketing and discovery card surface for public app-router pages

Rules:

- page composition should prefer these primitives over ad hoc nested wrappers
- if the same layout pattern appears in multiple features, extract it instead of restyling it repeatedly
- route shells should not invent unique content-width rules unless the route genuinely has a unique reading or task model
- public routes should use shared public-site primitives instead of repeating page-local shells and CTA markup

## Responsive contract

### Mobile rules

On phone widths:

- primary actions must remain visible without hover
- controls must remain comfortably tappable
- filters and action rows should wrap or stack before they compress into unreadable rows
- dense tables should degrade intentionally into stacked summaries, cards, or contained scroll only when the information truly requires it
- drawers and sheets should replace cramped desktop dialogs where needed
- sticky mobile action bars must respect safe-area insets

### Desktop rules

On laptop and desktop widths:

- preserve density where density improves comprehension
- use available width intentionally for forms, dashboards, and split-pane learning flows
- do not collapse naturally multi-column surfaces into oversized single-column cards unless that improves comprehension
- hover can enhance clarity, but the route must still work without hover-only discovery
- headers, filters, and action groups should align predictably so scanability improves as width increases

### Shared responsive rules

Across all breakpoints:

- no meaningful route should horizontally overflow at common viewport widths
- success, loading, empty, and error states should share the same container logic
- breakpoint transitions should preserve content hierarchy and action priority
- a smaller layout is not allowed to silently remove a core action without replacing it with an equivalent pattern

## Component governance

Continuum classifies UI into three ownership levels:

- foundation primitives
  - generic reusable controls and surfaces in `client/src/components/ui/*`
- shared composites
  - reusable product-facing composites such as page states, app shell pieces, and common feature shells
- feature wrappers
  - feature-owned assemblies that compose the lower layers without redefining the visual language

Rules:

- reusable styling should move down the ownership stack, not up
- if two features need the same variant, create or extend a shared primitive or shared composite
- feature wrappers may provide copy, composition, and route-specific state wiring, but they should not redefine foundational spacing, typography, or action hierarchy without a documented reason
- overlays must follow viewport-specific behavior:
  - dialog for desktop-sized constrained tasks
  - sheet or drawer for phone-first constrained tasks
- state surfaces should use the semantic status system rather than raw color choices

## Action hierarchy

Continuum keeps action hierarchy consistent:

- one primary action per local decision group
- secondary actions remain visible but visually subordinate
- destructive actions must remain explicit and must not masquerade as neutral buttons
- desktop may place secondary actions inline more often, but mobile should bias toward clearer vertical sequencing

## Current audit baseline

The current repository already has useful strengths:

- named theme ownership
- semantic status tokens
- a shared UI primitive layer
- shared public-site primitives for marketing and discovery routes
- responsive concern already called out in repo guidelines

The current audit also surfaced concrete drift to manage:

- raw palette outliers existed in leaderboard, auth, and public layout metadata before governance widened
- several feature and shell surfaces used arbitrary layout values for widths, heights, and dense-panel sizing before the shared sizing-token migration
- the authenticated shell, quiz surface, review panels, analytics tables, tutor chat, and public discovery pages were the highest-risk responsive surfaces before consolidation

Continuum treats those as tracked debt, not invisible background noise.

## Enforcement model

### Automated enforcement

`pnpm run lint` must enforce Continuum through:

- ESLint and type safety
- custom repo checks
- the design-system governance check in [script/check-design-system-governance.ts](/Users/aman/Projects/personal-projects/Learn-Language/script/check-design-system-governance.ts)

The governance check currently blocks:

- raw Tailwind palette classes in app-facing UI code
- raw hex color usage outside approved temporary exceptions
- arbitrary layout sizing and radius values in app-facing UI code unless they are token-based or explicitly allowlisted
- those rules now apply to both `client/src` and `app`

### Exception policy

Temporary exceptions are allowed only when:

- the current architecture seam does not yet support the correct shared token or primitive
- the exception is recorded with a reason in the governance allowlist
- the exception is tied to a follow-up migration path

### Review policy

UI changes should be reviewed for:

- one phone width and one desktop width
- shared primitive reuse before local styling invention
- semantic-token usage instead of raw palette classes
- intentional degradation of dense surfaces
- documentation updates when a durable layout or component rule changes

## Adoption rules for contributors

- read this document before introducing new shared UI patterns
- extend shared primitives or shared composites before creating feature-local style forks
- if a rule here conflicts with a one-off implementation convenience, Continuum wins unless the exception is documented
- if the product adds a new durable layout pattern, update this document in the same change

## Canonical ownership links

- theme tokens: [theme-system.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/theme-system.md)
- async and route-state behavior: [frontend-ui-contract.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/frontend-ui-contract.md)
- overall SPA architecture: [frontend-architecture.md](/Users/aman/Projects/personal-projects/Learn-Language/documentation/architecture/frontend-architecture.md)
- public route composition seam: [public-site.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/_components/public-site.tsx)
