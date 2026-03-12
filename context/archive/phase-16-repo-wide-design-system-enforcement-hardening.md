# Phase 16 - Repo-Wide Design System Enforcement Hardening

## Objective

Remove the remaining Continuum enforcement gaps so shared UI primitives, public routes, and authenticated app surfaces are all governed by the same design-system rules.

## Why this phase exists

Continuum is now documented, enforced across app routes and public routes, and adopted on the highest-risk surfaces. The remaining gap is narrower but important:

- the governance checker still exempts some shared primitive layout literals in `client/src/components/ui`
- some shared primitive sizing and panel values still rely on local arbitrary literals instead of named tokens
- as long as shared primitives are partially exempt, repo-wide enforcement is not truly universal

This phase closes that last governance loophole.

## Phase tasks

| ID | Status | Task | Depends On | Effort | Done When |
| -- | ------ | ---- | ---------- | ------ | --------- |
| P16-001 | done | Audit the remaining shared-primitives enforcement gaps | - | S | the remaining non-token arbitrary literals and checker exclusions are inventoried |
| P16-002 | done | Tighten the Continuum governance checker to cover shared primitives too | P16-001 | S | `client/src/components/ui` no longer has a blanket arbitrary-layout escape hatch |
| P16-003 | done | Replace remaining shared primitive arbitrary layout literals with named tokens or shared rules | P16-002 | M | shared primitives stop relying on local arbitrary layout values where a token can own the value |
| P16-004 | done | Add or update regression coverage for the hardened shared primitives and governance scope | P16-003 | S | tests and lint protect the new stricter repo-wide enforcement |
| P16-005 | done | Update canonical docs and archive the completed enforcement hardening slice | P16-004 | S | repo state and governance docs stay accurate |

## Exit criteria

- Continuum governance scans shared primitives without a blanket folder exclusion
- remaining shared primitive layout literals are token-backed, standardized, or intentionally justified
- `pnpm run lint` passes with the stricter governance scope

## Outcome

- removed the remaining `client/src/components/ui` arbitrary-layout exemption from the governance checker
- migrated shared primitive widths, heights, radii, scrollbar padding, separator hairlines, and panel constraints onto named Continuum size tokens in `client/src/index.css`
- enforced the stricter repo-wide scope successfully through `pnpm run check:design-system-governance` and `pnpm run lint`
