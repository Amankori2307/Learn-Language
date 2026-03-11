# Backend Refactor Invariants

This document is the execution baseline for `P9-008A`. It lists the backend behaviors most likely to be stressed by frontend contract refactors and the automated tests currently protecting them.

## Why these invariants matter

Phase 9 moved a large amount of request ownership, async handling, and presentational composition in the frontend. That work is only safe if the backend continues to guarantee:

- stable authorization boundaries
- stable request/response contracts
- language scoping
- predictable not-found and validation mapping
- stable persistence side effects for review and quiz mutations

## Invariant map

| Area | Invariant | Protected by |
| --- | --- | --- |
| auth | claims-backed user resolution preserves role mapping and profile backfill behavior | [auth.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.service.test.ts) |
| auth | auth endpoints reject missing identity and forward sanitized profile updates | [auth.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.controller.test.ts) |
| auth | reviewer-only boundaries block learner/unauthenticated access while allowing reviewer/admin/dev bootstrap users | [reviewer-authorization.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/reviewer-authorization.test.ts) |
| analytics | attempt-history payloads normalize dates and parsed language correctly | [analytics.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.service.test.ts) |
| analytics | leaderboard and bucket endpoints preserve default window/limit and parsed inputs | [analytics.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.service.test.ts) |
| analytics | controller layer forwards identity/language and maps service errors predictably | [analytics.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.controller.test.ts) |
| audio | audio resolution prefers existing sources, persists generated URLs, and rejects wrong-language requests | [audio.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/audio/audio.service.test.ts) |
| quiz | quiz generation reseeds empty candidate pools and answer submission enforces language boundaries | [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) |
| quiz | quiz answer submission persists progress and attempt side effects | [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts) |
| quiz | quiz controllers forward user-scoped inputs and map `AppError` correctly | [quiz.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.controller.test.ts) |
| review | queue normalization preserves nullable review metadata and bulk transitions report updated/skipped counts | [review.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.service.test.ts) |
| review | invalid review transitions and invalid conflict identifiers are rejected consistently | [review.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.service.test.ts) |
| review | controller layer forwards reviewer/submitter identity and maps history errors | [review.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.test.ts) |
| review | disagreement resolution preserves audit history end to end | [review-conflict.integration.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tests/review-conflict.integration.test.ts) |
| vocabulary | cluster and word lookup enforce language scoping and not-found semantics | [vocabulary.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.service.test.ts) |
| vocabulary | controller layer forwards cluster-language queries and maps not-found correctly | [vocabulary.controller.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.controller.test.ts) |
| storage | selected-language boundaries isolate user data reads across infrastructure queries | [storage.language-isolation.integration.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tests/storage.language-isolation.integration.test.ts) |

## Current command map

These are the backend-relevant commands currently used in local and CI verification:

- `pnpm test`
  - runs the Node test suite across backend unit, controller, service, and integration tests
- `pnpm run check`
  - keeps TypeScript contracts stable across frontend/backend refactors
- `pnpm run lint`
  - full quality gate, including backend tests plus frontend/UI checks
- `pnpm run test:e2e:smoke:development`
  - production-critical smoke verification for the integrated app path

## Remaining backend gaps

These are the highest-value remaining backend follow-ups after the current Phase 9 coverage expansion:

1. confirm whether additional controller/service tests are still needed for any newly added frontend failure states
2. tighten explicit documentation around which invariants are protected only by DB-backed integration tests
3. reassess whether the current smoke suite already covers all frontend-driven backend contracts strongly enough to mark `P9-010` complete later
