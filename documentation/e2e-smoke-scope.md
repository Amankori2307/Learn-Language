# E2E and Smoke Scope

This document is the execution baseline for `P9-010A`. It defines the minimum production-critical path set for Phase 9, the suite that currently owns each path, and the remaining automation gaps before `P9-010` can be closed.

## Why this scope exists

Phase 9 already has broad backend, frontend integration, and smoke coverage, but the final release-critical path set was still implicit. That made it too easy for the plan to drift away from the actual suites.

This document makes the current state explicit so:

- release-critical flows are named once and tracked consistently
- smoke coverage is distinguished from page-level integration coverage
- remaining gaps for learner, reviewer, and production-like verification stay visible

## Minimum production-critical path set

| Path | Why it is critical | Current automated owner | Current status |
| --- | --- | --- | --- |
| sign-in entry and authenticated bootstrap | users must be able to enter the app and restore an authenticated session | [auth.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/auth.integration.test.tsx), [use-auth-page-view-model.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/auth/use-auth-page-view-model.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | partially automated |
| dashboard load | learner home screen must render stable summary data and recover from retryable failures | [dashboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.integration.test.tsx) | automated in frontend integration, not yet in smoke |
| quiz start | learner must be able to generate a session across supported quiz modes | [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts), [quiz.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.controller.test.ts), [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) | automated |
| quiz submit | answer submission must persist progress and return a stable result contract | [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts), [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) | automated |
| analytics access | learners must be able to reach stats, learning insights, history, leaderboard, and word buckets | [history.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.integration.test.tsx), [leaderboard.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/leaderboard.integration.test.tsx), [word-buckets.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/word-buckets.integration.test.tsx), [contextual.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.integration.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| cluster access | learners must be able to list clusters and open a cluster detail route | [clusters.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.integration.test.tsx), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| reviewer queue access | reviewer-only queue must remain gated correctly and render stable queue states | [review.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.integration.test.tsx), [review.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.test.ts), [reviewer-authorization.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/reviewer-authorization.test.ts), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| draft creation | reviewer must be able to open add-vocabulary flow and submit a draft with stable auth boundaries | [add-vocabulary.integration.test.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/add-vocabulary.integration.test.tsx), [review.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.test.ts), [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | automated |
| production-like boot verification | local or CI verification must prove the integrated app still boots against production-style env | `pnpm run test:e2e:smoke:development`, `pnpm run test:e2e:smoke:production`, [smoke.e2e.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/e2e/smoke.e2e.test.ts) | partially automated |

## Suite ownership model

| Layer | Purpose | Current command |
| --- | --- | --- |
| backend unit and controller tests | protect request/response contracts, auth boundaries, language scoping, and mutation side effects | `pnpm test` |
| frontend integration tests | protect route composition, loading/error/empty states, role gating, and page-level regressions | `pnpm run test:ui` |
| integrated smoke test | prove the API-backed critical path is still live in development and production-like env modes | `pnpm run test:e2e:smoke:development`, `pnpm run test:e2e:smoke:production` |
| full release gate | run type, lint, backend, frontend, content, and smoke checks together | `pnpm run lint` and `pnpm run ci` |

## What the current smoke suite actually proves

The current smoke suite is API-level integrated verification. It currently proves that:

- auth bootstrap via signed bearer token works against `/auth/me`
- authenticated profile fetch works against `/api/profile`
- learner analytics endpoints respond for stats, learning insights, word buckets, attempt history, and leaderboard
- cluster list and cluster detail endpoints respond
- reviewer bootstrap resolves reviewer role through `/auth/me`, reviewer queue access responds, and draft creation succeeds
- quiz generation works across all supported modes
- quiz submission persists and returns a valid result payload
- the same smoke entrypoint can run in development or production env modes through dedicated scripts

## Remaining gaps before `P9-010` is complete

1. Add explicit learner-critical E2E ownership for dashboard load so `P9-010B` is not relying only on page integration coverage.
2. Decide whether the current API-level smoke suite is sufficient as the long-term production gate, or whether a browser-driven boot path is still required for `P9-010D`.
3. Consolidate the final release-gate guidance in Phase 9 docs once the remaining smoke/E2E decisions are implemented for `P9-010E`.
