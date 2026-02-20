# Phase 4B - Critical Fixes + Vocabulary Review Governance

Objective: stabilize broken user-facing modules (leaderboard/profile/avatar/styling) and add a mandatory human review workflow for new vocabulary quality.

## Entry criteria

- Phase 4 core hardening completed.
- Existing auth and session flows operational.

## Ordered tasks

### P4B-001 - Leaderboard fix end-to-end
Status: `done`

Scope:
- Trace leaderboard data path: source metric tables, aggregation query, API serialization, UI state handling.
- Validate time-window filters (daily/weekly/all-time) and tie-break logic.
- Handle empty-state and loading-state explicitly in UI.

Acceptance:
- Seeded test users appear with stable ranks.
- No blank leaderboard on valid data.
- API and UI snapshots align for rank, XP, streak columns.

### P4B-002 - Profile module repair
Status: `done`

Scope:
- Audit profile read path (`/api/auth/user` + profile enrich endpoint if present).
- Fix profile edit/update action and optimistic update rollback behavior.
- Ensure persisted fields survive session refresh and re-login.

Acceptance:
- User can load, edit, save, and re-open profile without data loss.
- Validation errors show clearly and do not break page rendering.

### P4B-003 - Avatar/image reliability
Status: `done`

Scope:
- Standardize avatar storage contract (`url`, `updated_at`, `source`).
- Fix upload/selection update pipeline and cache-busting on changed images.
- Add fallback rendering for missing/broken avatar URLs.

Acceptance:
- Avatar changes immediately in profile + header areas.
- Reloading app keeps selected avatar.
- Broken URLs render fallback avatar, not broken-image icon.

### P4B-004 - Styling consistency pass
Status: `done`

Scope:
- Build screen-by-screen QA checklist (dashboard, quiz, profile, leaderboard, auth, contextual mode).
- Fix spacing, font scale, contrast, and breakpoint regressions.
- Remove ad-hoc style overrides and align to tokens/utility patterns.

Acceptance:
- Mobile (<=768px) and desktop (>=1024px) layouts pass visual checklist.
- No critical overlap/cutoff issues in major flows.

### P4B-005 - Regression tests for critical UX modules
Status: `doing`

Scope:
- Add backend tests for leaderboard/profile/avatar APIs.
- Add frontend integration tests for profile save, avatar refresh, leaderboard rendering states.
- Add visual smoke checks for core pages where feasible.

Acceptance:
- New tests fail on previous buggy behavior and pass on fixed behavior.
- CI gates include this suite.

### P4B-006 - Vocabulary review schema and state machine
Status: `todo`

Scope:
- Add vocabulary lifecycle states: `draft`, `pending_review`, `approved`, `rejected`.
- Add fields: `submitted_by`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `source_url`, `source_captured_at`.
- Add immutable audit trail table for every state transition.

Acceptance:
- Every vocabulary item has explicit review state.
- State transitions are validated server-side.

### P4B-007 - Reviewer queue and permissions
Status: `todo`

Scope:
- Add reviewer role(s) and route guards.
- Build reviewer queue views with filters: cluster, POS, source, age, state.
- Add item detail panel with source evidence + edit history.

Acceptance:
- Non-reviewers cannot approve/reject.
- Reviewer can process queue from pending list to final decision.

### P4B-008 - Approval gate in learner flows
Status: `todo`

Scope:
- Filter out non-approved vocabulary from quiz generation, search, cluster stats, and tutor context by default.
- Add optional internal toggle for admins to preview non-approved items.

Acceptance:
- Learner-facing sessions only contain approved items unless explicit admin override.

### P4B-009 - Source evidence + change history UX
Status: `todo`

Scope:
- Show source URL(s), extraction/import timestamp, and editor timeline per item.
- Add diff view for meaning/sentence/category edits between revisions.

Acceptance:
- Reviewer can trace where each entry came from and what changed.

### P4B-010 - Reviewer productivity features
Status: `todo`

Scope:
- Bulk approve/reject for selected entries with mandatory notes on rejection.
- Re-open flow for previously approved/rejected items.
- Conflict lock: prevent simultaneous conflicting reviews.

Acceptance:
- Reviewer can process batches efficiently with full auditability.

### P4B-011 - AI/manual content as draft-only
Status: `todo`

Scope:
- Allow content suggestions from AI/manual editor.
- Auto-mark all generated/manual submissions as `draft` or `pending_review`.
- Block direct publish to approved without reviewer action.

Acceptance:
- No generated vocabulary reaches learner sessions without explicit reviewer approval.

### P4B-012 - Pronunciation-first UI/UX mode
Status: `done`

Scope:
- Make transliteration (English pronunciation) the primary display for vocabulary prompts.
- Render Telugu script as secondary context in brackets.
- Update quiz question surfaces, options, answer feedback, and word cards for consistency.

Acceptance:
- Learner can progress through core flows focusing on pronunciation-first text.
- Telugu script remains visible but clearly secondary.

## Exit criteria

- Leaderboard/profile/avatar/styling issues are closed with regression coverage.
- Vocabulary review workflow is enforced and auditable.
- Approved-vocabulary gate protects learner-facing quality.
