# Core Features

This document lists the application's core features based on the current implementation in the repository. It is intentionally scoped to the product backbone rather than every supporting or operational capability.

## Product pillars

The application is built around these core pillars:

1. Authenticated learners and role-aware access
2. Vocabulary as the primary learning object
3. Quiz-driven practice
4. Spaced repetition and mastery tracking
5. Cluster/context-based vocabulary organization
6. Learner analytics and progress visibility
7. Reviewer-governed content curation

## Core feature set

### 1. Authentication and access control

Implemented behavior:

- Google OAuth sign-in flow
- authenticated session handling
- protected learner routes
- role-aware access for `learner`, `reviewer`, and `admin`

Implementation references:

- [client/src/pages/auth.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/auth.tsx)
- [client/src/hooks/use-auth.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-auth.ts)
- [server/src/modules/auth/auth.oidc.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.oidc.ts)
- [server/src/modules/auth/auth.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/auth/auth.controller.ts)
- [shared/domain/enums.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/domain/enums.ts)

### 2. Vocabulary-centered learning model

Implemented behavior:

- words are the main learning unit
- each word carries language, original script, transliteration, English meaning, part of speech, difficulty, tags, and optional media
- words can have linked example sentences
- words can belong to one or more clusters

Implementation references:

- [server/src/infrastructure/tables/words.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/words.table.ts)
- [server/src/infrastructure/tables/word-examples.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/word-examples.table.ts)
- [server/src/infrastructure/tables/clusters.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/clusters.table.ts)
- [server/src/infrastructure/tables/word-clusters.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/word-clusters.table.ts)
- [server/src/modules/vocabulary/vocabulary.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.controller.ts)

### 3. Quiz-driven practice

Implemented behavior:

- quiz session generation from the backend
- answer submission with correctness feedback
- supported quiz modes:
  - `daily_review`
  - `new_words`
  - `weak_words`
  - `cluster`
  - `complex_workout`
- supported question directions:
  - source language to English
  - English to source language
- confidence level capture on answers, with the quiz-side selector available behind an explicit learner preference
- response-time capture on answers
- completion flows with next recommended session

Implementation references:

- [client/src/pages/quiz.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/quiz.tsx)
- [client/src/features/quiz/use-quiz-page-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/quiz/use-quiz-page-view-model.ts)
- [client/src/hooks/use-quiz.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-quiz.ts)
- [client/src/components/quiz-card.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/quiz-card.tsx)
- [server/src/modules/quiz/quiz.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/quiz/quiz.controller.ts)
- [shared/routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)

### 4. Spaced repetition and mastery tracking

Implemented behavior:

- per-user word progress storage
- mastery tracking
- next-review scheduling
- correct streak and wrong count tracking
- direction-specific memory strength tracking
- stats-driven recommendation of next mode/direction

Implementation references:

- [server/src/infrastructure/tables/user-word-progress.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/user-word-progress.table.ts)
- [server/src/infrastructure/services/srs.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/services/srs.ts)
- [server/src/infrastructure/services/srs-config.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/services/srs-config.ts)
- [server/src/modules/analytics/analytics.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.controller.ts)
- [client/src/features/dashboard/use-dashboard-view-model.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/features/dashboard/use-dashboard-view-model.ts)

### 5. Cluster and context-based vocabulary organization

Implemented behavior:

- browse clusters
- search/filter/sort/paginate clusters
- practice by cluster
- contextual learning page generated from cluster-linked words/examples

Implementation references:

- [client/src/pages/clusters.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/clusters.tsx)
- [client/src/pages/contextual.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/contextual.tsx)
- [client/src/hooks/use-clusters.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-clusters.ts)
- [server/src/modules/vocabulary/vocabulary.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/vocabulary/vocabulary.controller.ts)

### 6. Learner analytics and progress visibility

Implemented behavior:

- dashboard summary for XP, streak, mastered, learning, and needs-review counts
- word bucket drill-down views
- attempt history with filtering, sorting, and pagination
- learning insights
- leaderboard with daily, weekly, and all-time windows
- profile-backed learner identity display

Implementation references:

- [client/src/pages/dashboard.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/dashboard.tsx)
- [client/src/pages/history.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/history.tsx)
- [client/src/pages/word-buckets.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/word-buckets.tsx)
- [client/src/pages/leaderboard.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/leaderboard.tsx)
- [server/src/modules/analytics/analytics.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/analytics/analytics.controller.ts)
- [shared/routes.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/routes.ts)

### 7. Reviewer-governed vocabulary curation

Implemented behavior:

- reviewer/admin-only review surfaces
- vocabulary draft submission
- review queue by status
- approve/reject actions
- bulk review transitions
- review notes and audit trail
- review history per word
- backend support for conflict handling and secondary-review metadata

Implementation references:

- [client/src/pages/review.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/review.tsx)
- [client/src/pages/add-vocabulary.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/pages/add-vocabulary.tsx)
- [client/src/components/review/create-vocabulary-draft-form.tsx](/Users/aman/Projects/personal-projects/Learn-Language/client/src/components/review/create-vocabulary-draft-form.tsx)
- [client/src/hooks/use-review.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/hooks/use-review.ts)
- [server/src/modules/review/review.controller.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/modules/review/review.controller.ts)
- [server/src/infrastructure/tables/word-review-events.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/word-review-events.table.ts)

## Supporting but non-core features

These are implemented, but they are not the primary product backbone:

- profile editing
- optional audio resolution/generation support
- optional image hints
- text-only tutor mode
- admin seed endpoint
- admin SRS drift monitoring endpoint

## Domain backbone

The core features above are built primarily on these domain entities:

- `User`
- `Word`
- `Cluster`
- `WordExample`
- `UserWordProgress`
- `QuizAttempt`
- `WordReviewEvent`
- `SrsConfig`

Implementation references:

- [server/src/infrastructure/schema.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/schema.ts)
- [server/src/infrastructure/tables/users.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/users.table.ts)
- [server/src/infrastructure/tables/words.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/words.table.ts)
- [server/src/infrastructure/tables/clusters.table.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/infrastructure/tables/clusters.table.ts)
