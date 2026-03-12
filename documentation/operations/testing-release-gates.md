# Testing And Release Gates

This document is the canonical testing and verification overview for the repository.

## Main commands

- `pnpm run lint`
  - eslint with zero warnings
  - typecheck
  - content validation
  - single-source seed verification
  - symbol governance checks
  - backend tests
  - UI tests
- `pnpm run ci`
  - full lint gate plus smoke coverage
- `pnpm run test:e2e:smoke:development`
- `pnpm run test:e2e:smoke:production`

## Coverage model

The repo relies on three layers:

### Backend tests

Own:

- API contracts
- authorization boundaries
- language scoping
- persistence side effects
- backend invariants stressed by frontend refactors

### Frontend integration and component tests

Own:

- route composition
- loading, error, empty, and pending states
- role-gated behavior
- responsive class-level regressions on core surfaces
- extracted feature and primitive behavior

### Integrated smoke tests

Own:

- authenticated bootstrap
- dashboard load
- quiz generation and submission
- analytics access
- cluster access
- reviewer queue access
- draft creation
- production-like app boot verification

## Current release-critical path set

The enforced release gate covers:

- sign-in entry and authenticated bootstrap
- dashboard load
- quiz start
- quiz submit
- analytics access
- cluster access
- reviewer queue access
- add-vocabulary draft creation
- production-like boot verification

## CI posture

GitHub Actions provisions Postgres, runs migrations and content import, runs `pnpm run ci`, runs production-like smoke coverage, and then builds artifacts.

The workflow now opts JavaScript-based actions into the GitHub Actions Node.js 24 runtime ahead of the June 2, 2026 default change. It uses `actions/checkout@v6`, `actions/setup-node@v6`, and installs `pnpm` through `corepack` instead of `pnpm/action-setup`, because the latest published `pnpm/action-setup` release still targets the deprecated Node.js 20 action runtime.

## Maintenance rule

When a change adds a new critical route, a new correctness-sensitive API behavior, or a new shared UI state pattern, update this document and the relevant test coverage in the same change.
