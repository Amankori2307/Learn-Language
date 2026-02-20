# Phase 4B - Active Review Governance Work

Objective: enforce vocabulary quality through reviewer controls and safe publishing.

## In progress

### P4B-007 - Reviewer queue and permissions
Status: `done`

Scope:
- Add reviewer/admin-only guards for review actions.
- Provide reviewer-facing queue UI to process pending terms.

Acceptance:
- Non-reviewers cannot approve/reject.
- Reviewer can move items across review states from UI.

Validation:
- Endpoint-level middleware tests enforce learner block and reviewer/admin allow paths.
- Dev runtime path validated with reviewer UI routes and guarded actions.

## Pending

### P4B-008 - Approval gate in learner flows
Status: `done`

Scope:
- Filter learner-facing content to approved vocabulary only by default.

Acceptance:
- Quiz/session/search flows exclude non-approved words unless explicit admin override.

### P4B-009 - Source evidence and change history UX
Status: `done`

Scope:
- Show source URL, capture timestamp, and revision timeline in review UI.

Acceptance:
- Reviewer can audit each vocabulary entry end-to-end.

### P4B-010 - Reviewer productivity features
Status: `done`

Scope:
- Bulk review actions, reviewer comments, and conflict-safe updates.

Acceptance:
- Review throughput improves without losing audit traceability.

### P4B-011 - Draft-only AI/manual vocabulary creation
Status: `done`

Scope:
- Ensure generated/manual entries start in draft or pending review.

Acceptance:
- No auto-publish of unreviewed vocabulary.

### P4B-013 - Docker compose hot reload support
Status: `done`

Scope:
- Keep compose in dev/hot-reload mode with backend watch and live frontend updates.
- Document expected behavior and troubleshooting.

Acceptance:
- Editing backend/frontend files reflects live in running compose stack without image rebuild.
- Runtime validation captured: backend `tsx` auto-restart and Vite HMR update observed under compose.

### P4B-015 - DB migration/backfill scripts for review governance
Status: `done`

Scope:
- Add idempotent migration script for role/review columns and review events table.
- Add backfill script for null/invalid role/review state values.

Acceptance:
- Existing DBs can be upgraded safely without full reset.

### P4B-016 - Reviewer authorization tests
Status: `done`

Scope:
- Add automated tests covering reviewer middleware auth behavior for learner/reviewer/admin.

Acceptance:
- Non-reviewers are blocked and reviewer/admin paths are allowed in tests.

### P4B-017 - UI integration tests for profile + review flows
Status: `done`

Scope:
- Add UI-level integration coverage for profile save interactions.
- Add UI-level integration coverage for reviewer queue approve actions.

Acceptance:
- Regression tests catch profile form and reviewer queue action breakages.

### P4B-018 - Replace dummy MVP seed with realistic source language vocabulary
Status: `done`

Scope:
- Replace placeholder/dummy seed entries in `assets/processed/seed.json` with practical beginner source language vocabulary.
- Keep transliteration-first style and ensure English gloss + short usage examples per entry.

Acceptance:
- Imported dataset feels realistic for early learners and no obvious placeholder content remains.
