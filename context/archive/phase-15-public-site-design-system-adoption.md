# Phase 15 - Public Site Design System Adoption

## Objective

Extend the Continuum design system from authenticated app surfaces into the public Next.js marketing and discovery routes so the public site follows the same layout, component, and responsive-governance contract.

## Why this phase existed

Phase 14 established Continuum for the app surfaces and enforced governance through the lint gate, but the public routes under `app/` were still mostly page-local compositions with repeated CTA, card, and content-shell patterns.

That left the repo with a split visual governance model:

- authenticated app routes were governed by Continuum
- public marketing and discovery routes still relied on repeated page-local markup

This phase closed that gap.

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P15-001 | done | Audit current public route layout and repeated styling seams | - | S | repeated public shells, CTA rows, cards, and content-width patterns are identified |
| P15-002 | done | Extract reusable public-site Continuum primitives for page shells, intros, sections, cards, and CTA rows | P15-001 | M | public routes can compose shared public patterns instead of re-declaring them |
| P15-003 | done | Refactor public routes onto the shared public-site layer | P15-002 | M | the core public marketing pages stop duplicating the same layout and action patterns |
| P15-004 | done | Extend design-system governance enforcement into `app/` | P15-002 | S | lint catches raw design-system drift on public routes too |
| P15-005 | done | Update canonical architecture and design-system documentation for public-site ownership | P15-003,P15-004 | S | docs describe Continuum as repo-wide, including public routes |

## Execution map

### P15-001 - Public route audit

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P15-001A | done | Inventory repeated public page shells, headings, section wrappers, CTA rows, and card patterns across `/`, `/features`, `/how-it-works`, `/languages/telugu`, and `/topics` | - | shared seams are explicit |
| P15-001B | done | Identify governance gaps where public routes were not covered by the Continuum checker | P15-001A | public governance scope is clear |

### P15-002 - Shared public primitives

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P15-002A | done | Add shared public-site shell, section, intro, card, and CTA primitives under `app/_components/` | P15-001 | public routes have a shared composition layer |
| P15-002B | done | Keep those primitives Continuum-safe by using the same semantic tokens and responsive patterns as the app surfaces | P15-002A | public and app routes share one visual contract |

### P15-003 - Public route migration

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P15-003A | done | Refactor `/features`, `/how-it-works`, `/languages/telugu`, and `/topics` to use shared public-site primitives | P15-002 | repeated public layout code is reduced |
| P15-003B | done | Refactor the home route to reuse shared public card and section patterns where appropriate without flattening its hero-specific composition | P15-003A | the home route remains distinctive while still following Continuum |

### P15-004 - Enforcement

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P15-004A | done | Extend `script/check-design-system-governance.ts` to scan `app/` in addition to client app UI | P15-002 | public routes are lint-governed |
| P15-004B | done | Fix any newly surfaced public-route violations instead of allowlisting them | P15-004A | governance passes cleanly across both route systems |

### P15-005 - Documentation closeout

| ID | Status | Task | Depends On | Done When |
| -- | ------ | ---- | ---------- | --------- |
| P15-005A | done | Update Continuum documentation to cover public-site primitives and ownership | P15-003,P15-004 | design-system documentation is repo-wide |
| P15-005B | done | Update frontend architecture and execution context to reflect public-site design-system adoption | P15-005A | repo state is documented accurately |

## Done-when

- public routes use shared Continuum primitives instead of repeated page-local shells and CTA patterns
- design-system governance enforcement scans both `client/src` and `app/`
- public-site design rules are documented as part of Continuum rather than a separate styling island
- repo planning state and archive history capture the completed slice

## Exit criteria

- [public-site.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/_components/public-site.tsx) exists as the public-site composition seam
- the main public routes compose those primitives
- `pnpm run lint` passes with `app/` included in design-system governance scanning
