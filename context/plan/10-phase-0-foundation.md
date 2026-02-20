# Phase 0 - Foundation and Guardrails

Objective: stabilize project setup so all later feature work is predictable and resumable.

## Entry criteria

- Repository builds locally.
- Existing auth and DB setup understood.

## Tasks

### P0-001 - Environment contract
Status: `done`

Steps:
1. Create `.env.example` with all required runtime keys.
2. Mark required vs optional keys.
3. Add startup-time validation.

Acceptance:
- Running app without required keys fails with explicit message.

### P0-002 - Config module
Status: `done`

Steps:
1. Add a single config loader module.
2. Parse and type-check all env values.
3. Export typed config object used by server modules.

Acceptance:
- No direct `process.env` reads outside config module.

### P0-003 - Dev quality baseline
Status: `done`

Steps:
1. Ensure `lint`, `typecheck`, and `test` scripts exist.
2. Add CI command that runs all three.
3. Fix failing baseline issues.

Acceptance:
- Baseline quality commands pass consistently.

### P0-004 - API error standardization
Status: `done`

Steps:
1. Define a common error envelope `{ code, message, details?, requestId? }`.
2. Add route-level validation error mapping.
3. Add unknown-error fallback handler.

Acceptance:
- All non-2xx API responses follow same shape.

### P0-005 - Seed idempotency
Status: `done`

Steps:
1. Make seed operation safe to run repeatedly.
2. Add duplicate prevention on words/clusters links.
3. Log final seed counts.

Acceptance:
- Re-running seed does not create duplicates.

## Exit criteria

- All Phase 0 tasks are `done`.
- Project can be executed by another agent without setup ambiguity.
