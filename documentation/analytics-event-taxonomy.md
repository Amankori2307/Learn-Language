# Analytics Event Taxonomy

This document is the execution contract for `P10-005`. It defines the initial analytics abstraction, provider model, and first event set for the app.

## Goals

- emit product analytics through one controlled adapter
- keep vendor SDK details out of feature components
- make event naming and properties stable before broad rollout
- support local verification without requiring a hosted vendor during development

## Provider model

Current client analytics providers:

- `noop`
- `console`
- `window-mixpanel`

Provider selection comes from:

- `NEXT_PUBLIC_ANALYTICS_PROVIDER`

Current meanings:

- `noop`: drop all analytics events
- `console`: log events to browser console for verification
- `window-mixpanel`: call `window.mixpanel.track(...)` when Mixpanel is already present on the page

Primary implementation file:

- [analytics.ts](/Users/aman/Projects/personal-projects/Learn-Language/client/src/lib/analytics.ts)

## Initial event set

Current event names:

- `auth_login_started`
- `auth_login_completed`
- `quiz_session_started`
- `quiz_answer_submitted`
- `quiz_session_completed`
- `clusters_catalog_viewed`
- `review_transition_completed`
- `review_bulk_transition_completed`
- `review_draft_created`
- `profile_updated`

## Shared event-property guidance

Use only the properties relevant to the event. Current allowed/common categories:

- route context:
  - `route`
- language context:
  - `language`
- auth context:
  - `source`
- quiz context:
  - `mode`
  - `clusterId`
  - `questionType`
  - `direction`
  - `responseTimeMs`
  - `isCorrect`
  - `total`
  - `correct`
  - `incorrect`
  - `accuracyPercent`
- review context:
  - `wordId`
  - `toStatus`
  - `count`
- profile context:
  - `hasAvatar`
  - `hasFirstName`
  - `hasLastName`
- analytics/catalog context:
  - `totalResults`
  - `typeFilter`
  - `sortBy`

## Ownership rules

Current ownership rule:

- emit analytics from view-models, hooks, or service boundaries
- do not call analytics adapters directly from presentational UI components
- do not scatter vendor SDK calls across feature files

## Privacy boundaries

Current rule set:

- do not include secrets, tokens, cookies, or raw auth payloads
- do not include full free-text user content unless explicitly approved later
- prefer IDs, enums, booleans, counts, and bounded categorical values

## Current rollout scope

The first rollout should cover:

- auth start/completion
- quiz start/answer/completion
- clusters catalog usage
- review transition/bulk transition/draft creation
- profile update

Later work can add:

- server-side authoritative completion events
- user/role enrichment rules
- deduplication guidance where client and server both emit related events
