# Production Runbook

## Scope

Operational runbook for deploy, rollback, and incident handling of Learn Telugu app.

## Prerequisites

- Node.js 20+
- PostgreSQL reachable via `DATABASE_URL`
- Required env vars configured from `.env.example`

## Deploy Procedure

1. Pull latest `main`.
2. Install dependencies: `npm ci`.
3. Run quality gate: `npm run ci`.
4. Push DB schema changes: `npm run db:push`.
5. Build artifacts: `npm run build`.
6. Start service: `npm run start`.
7. Run smoke checks:
- `/api/stats` (authenticated)
- `/api/quiz/generate?mode=daily_review`
- `/api/quiz/submit` with valid payload

## Rollback Procedure

1. Redeploy previous known-good commit.
2. If schema migration is backward compatible, keep current DB.
3. If migration breaks compatibility, apply documented reverse migration before app rollback.
4. Re-run smoke checks.

## Incident Playbook

### Symptom: quiz generation failures

1. Check API logs for `quiz_session_generated` events.
2. Validate DB connectivity.
3. Verify candidate pool availability (`words`, `word_clusters`).
4. Re-run seed/import for emergency recovery if content missing.

### Symptom: answer submission failures

1. Check `quiz_answer_submitted` logs and HTTP status.
2. Validate payload contract (`confidenceLevel`, `selectedOptionId`).
3. Confirm `user_word_progress` row exists or can be created.

### Symptom: high error rates after deploy

1. Roll back to last stable commit.
2. Capture failing request IDs from API responses.
3. Open postmortem issue with timeline and root-cause notes.

## Monitoring Signals

- API error rate by endpoint
- quiz generation latency
- submit-answer latency
- streak/XP update anomalies

