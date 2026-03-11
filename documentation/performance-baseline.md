# Performance Baseline

This document is the active execution record for `P10-008`.

## Measurement date

- 2026-03-11

## Frontend baseline

Command run:

```sh
pnpm run build:frontend
```

Observed result:

- production build completed successfully
- app routes currently emitted by the Next app shell:
  - `/_not-found`
  - `/[[...slug]]`
  - `/robots.txt`
  - `/sitemap.xml`
- build emitted one warning:
  - `themeColor` is configured in metadata export for `/_not-found` and should be moved to `viewport`

Initial interpretation:

- the Next app shell itself is small and not the obvious primary bottleneck
- the more likely runtime cost is in the client SPA data flows and backend request work, not in a large static app-route bundle
- the metadata warning should be handled later in `P10-009`, not folded into performance work

## Backend hotspot audit

Initial high-cost candidates identified from code inspection:

- `QuizService.generateQuiz`
  - loads a 500-word distractor pool
  - previously loaded all word-cluster links globally on every request
- `storage.getLeaderboard`
  - loads all users plus all relevant attempts into memory
  - computes ranking in application code
- `storage.getLearningInsights`
  - loads attempt rows, cluster rows, and progress rows into memory
  - aggregates accuracy/category/cluster insights in application code
- `storage.getClusters`
  - performs separate cluster and count queries, then enriches and filters in application code

## First optimization slice completed

Optimization:

- quiz generation now narrows the word-cluster link query to the actual distractor pool IDs instead of querying all cluster links globally

Files:

- [quiz.service.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.ts)
- [quiz.repository.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.repository.ts)
- [storage.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/storage.ts)
- [quiz.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.service.test.ts)

Why this was chosen first:

- low risk
- request-local change
- no contract change
- removes unnecessary table-wide work from a hot learner endpoint

## Second optimization slice completed

Optimization:

- analytics-heavy storage reads now run independent queries in parallel where possible
- leaderboard entry computation now uses a single per-user pass instead of repeated filtering over each user's attempts

Files:

- [storage.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/storage.ts)
- [leaderboard.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/services/leaderboard.ts)

What changed:

- `getClusters(...)` now fetches cluster rows and count rows concurrently
- `getLeaderboard(...)` now fetches users and attempts concurrently before ranking
- `getLearningInsights(...)` now fetches attempt rows, cluster rows, and progress rows concurrently before in-memory aggregation
- `computeLeaderboard(...)` now computes `correctAttempts`, `hardCorrectAttempts`, and streak dates in one pass per user

Why this was chosen second:

- low behavioral risk
- reduces avoidable endpoint latency caused by serialized DB waits
- tightens CPU work on a hot analytics path without changing ranking semantics

## Third optimization slice completed

Optimization:

- aggregate analytics read endpoints now use a short-lived in-memory cache at the service boundary

Files:

- [analytics.service.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.service.ts)
- [analytics.service.test.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.service.test.ts)

What changed:

- `getStats(...)`, `getLearningInsights(...)`, `getWordBucket(...)`, `getAttemptHistory(...)`, and `getLeaderboard(...)` now cache normalized read results for 15 seconds per process
- cache keys are scoped by the normalized user and query dimensions so repeated dashboard/analytics refreshes do not immediately recompute the same aggregates

Why this was chosen third:

- low implementation risk
- avoids repeated recomputation on the most read-heavy aggregate endpoints
- keeps correctness acceptable because the TTL is short and analytics surfaces are informational rather than transactional

## Fourth optimization slice completed

Optimization:

- learning-insights category and cluster aggregation now use grouped SQL queries instead of per-row in-memory accumulation

Files:

- [storage.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/storage.ts)

What changed:

- category totals and accuracy now come from grouped attempt queries by part of speech
- cluster word counts now come from grouped approved-word counts
- cluster attempt/correct totals now come from grouped quiz-attempt queries joined through cluster links
- only weak/strong word ranking remains intentionally in-memory because it depends on ordered user progress rows rather than simple aggregate counts

Why this was chosen fourth:

- it removes one of the last obvious cold-read hotspots in the analytics path
- it reduces payload shaping work in application code without changing the response contract
- it complements the short-lived cache by lowering the cost of cache misses

## Current ranking of likely next performance work

1. leaderboard aggregation pushdown or user narrowing without changing empty-state behavior
2. quiz distractor-pool sizing review and possible caching of stable reference data
3. cluster listing query consolidation beyond the current parallel-query improvement
4. route-level frontend client payload inspection if the SPA shell becomes the next bottleneck

## Current status

- `P10-008A`: in progress
- `P10-008B`: in progress
- `P10-008C`: in progress
- `P10-008D`: started with the first backend optimization slice above

## Known limitations

- no DB-backed latency benchmark was captured yet in this environment
- backend p50/p95 numbers still need a runnable local or production-like database target
- frontend client-bundle breakdown outside the Next app shell still needs route-level inspection if client payload becomes suspect
