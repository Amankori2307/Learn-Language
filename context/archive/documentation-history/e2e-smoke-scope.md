# E2E and Smoke Scope

This document defines the current production-critical path set, the suite that owns each path, and the release-gate coverage enforced in local verification and CI.

## Why this scope exists

Phase 9 already has broad backend, frontend integration, and smoke coverage, but the final release-critical path set was still implicit. That made it too easy for the plan to drift away from the actual suites.

This document makes the current state explicit so:

- release-critical flows are named once and tracked consistently
- smoke coverage is distinguished from page-level integration coverage
- the maintained release-gate scope stays visible as the app evolves

## Minimum production-critical path set

| Path | Why it is critical | Current automated owner | Current status |
| --- | --- | --- | --- |
| sign-in entry and authenticated bootstrap | users must be able to enter the app and restore an authenticated session | [auth.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/auth.integration.test.tsx), [use-auth-page-view-model.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/use-auth-page-view-model.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| dashboard load | learner home screen must render stable summary data and recover from retryable failures | [dashboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.integration.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| quiz start | learner must be able to generate a session across supported quiz modes | [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts), [quiz.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.controller.test.ts), [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) | automated |
| quiz submit | answer submission must persist progress and return a stable result contract | [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts), [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) | automated |
| analytics access | learners must be able to reach stats, learning insights, history, leaderboard, and word buckets | [history.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.integration.test.tsx), [leaderboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/leaderboard.integration.test.tsx), [word-buckets.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/word-buckets.integration.test.tsx), [contextual.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.integration.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| cluster access | learners must be able to list clusters and open a cluster detail route | [clusters.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.integration.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| reviewer queue access | reviewer-only queue must remain gated correctly and render stable queue states | [review.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.integration.test.tsx), [review.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.test.ts), [reviewer-authorization.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/reviewer-authorization.test.ts), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| draft creation | reviewer must be able to open add-vocabulary flow and submit a draft with stable auth boundaries | [add-vocabulary.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/add-vocabulary.integration.test.tsx), [review.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.test.ts), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| production-like boot verification | local or CI verification must prove the integrated app still boots against production-style env | `pnpm run test:e2e:smoke:development`, `pnpm run test:e2e:smoke:production`, [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts), [ci-cd.yml](/Users/aman/Projects/personal-projects/Learn-Language/.github/workflows/ci-cd.yml) | automated |

## Suite ownership model

| Layer | Purpose | Current command |
| --- | --- | --- |
| backend unit and controller tests | protect request/response contracts, auth boundaries, language scoping, and mutation side effects | `pnpm test` |
| frontend integration tests | protect route composition, loading/error/empty states, role gating, and page-level regressions | `pnpm run test:ui` |
| integrated smoke test | prove the API-backed critical path is still live in development and production-like env modes | `pnpm run test:e2e:smoke:development`, `pnpm run test:e2e:smoke:production` |
| full release gate | run type, lint, backend, frontend, content, and smoke checks together | `pnpm run lint`, `pnpm run ci`, and the `quality` job in [ci-cd.yml](/Users/aman/Projects/personal-projects/Learn-Language/.github/workflows/ci-cd.yml) |

## Release-gate decision

Phase 9 does not require a separate browser-driven E2E harness.

The enforced production-critical gate for this repository is:

- frontend page integration tests for route composition and loading/error/empty state behavior
- backend unit/controller/integration tests for contracts and authorization boundaries
- API-level integrated smoke verification for live critical-path availability in both development and production-like env modes

This split matches the current architecture:

- frontend state branching is already protected in [test:ui](/Users/aman/Projects/personal-projects/Learn-Language/vitest.config.ts)-backed page integration tests
- backend contracts and persistence side effects are protected in Node test suites
- the smoke suite proves the deployed app can authenticate, query learner analytics, access review endpoints, and run quiz generation/submission against a real database

Because those responsibilities are already covered at the correct layers, adding browser automation in Phase 9 would duplicate high-cost coverage without protecting a unique production-critical contract.

## CI enforcement

The repository now enforces the release gate in [ci-cd.yml](/Users/aman/Projects/personal-projects/Learn-Language/.github/workflows/ci-cd.yml) by:

1. provisioning Postgres
2. running `pnpm run db:migrate` and `pnpm run content:import`
3. running `pnpm run ci`
4. running `pnpm run test:e2e:smoke:production`
5. building frontend and backend artifacts

## What the current smoke suite actually proves

The current smoke suite is API-level integrated verification. It currently proves that:

- auth bootstrap via signed bearer token works against `/api/auth/me`
- authenticated profile fetch works against `/api/auth/profile`
- learner analytics endpoints respond for stats, learning insights, word buckets, attempt history, and leaderboard
- cluster list and cluster detail endpoints respond
- reviewer bootstrap resolves reviewer role through `/api/auth/me`, reviewer queue access responds, and draft creation succeeds
- quiz generation works across all supported modes
- quiz submission persists and returns a valid result payload
- the same smoke entrypoint can run in development or production env modes through dedicated scripts

## Remaining gaps before `P9-010` is complete

No additional Phase 9 smoke/E2E gaps are currently open.
