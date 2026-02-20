# Phase 4B - Active Review Governance Work

Objective: enforce vocabulary quality through reviewer controls and safe publishing.

## In progress

### P4B-007 - Reviewer queue and permissions
Status: `doing`

Scope:
- Add reviewer/admin-only guards for review actions.
- Provide reviewer-facing queue UI to process pending terms.

Acceptance:
- Non-reviewers cannot approve/reject.
- Reviewer can move items across review states from UI.

## Pending

### P4B-008 - Approval gate in learner flows
Status: `todo`

Scope:
- Filter learner-facing content to approved vocabulary only by default.

Acceptance:
- Quiz/session/search flows exclude non-approved words unless explicit admin override.

### P4B-009 - Source evidence and change history UX
Status: `todo`

Scope:
- Show source URL, capture timestamp, and revision timeline in review UI.

Acceptance:
- Reviewer can audit each vocabulary entry end-to-end.

### P4B-010 - Reviewer productivity features
Status: `todo`

Scope:
- Bulk review actions, reviewer comments, and conflict-safe updates.

Acceptance:
- Review throughput improves without losing audit traceability.

### P4B-011 - Draft-only AI/manual vocabulary creation
Status: `todo`

Scope:
- Ensure generated/manual entries start in draft or pending review.

Acceptance:
- No auto-publish of unreviewed vocabulary.

### P4B-013 - Docker compose hot reload support
Status: `todo`

Scope:
- Keep compose in dev/hot-reload mode with backend watch and live frontend updates.
- Document expected behavior and troubleshooting.

Acceptance:
- Editing backend/frontend files reflects live in running compose stack without image rebuild.
