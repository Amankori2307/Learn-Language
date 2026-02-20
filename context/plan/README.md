# Learn Telugu App - Phased Build Plan (Text-First)

This folder is the execution system for building the app in strict order.

Source inputs used:
- Shared requirement transcript (from attached project assets).
- Existing codebase architecture in this repository.

Primary delivery rule:
- Prioritize text-first learning and core quiz/SRS experience.
- Defer audio, video, and image-heavy features to the final phase only.

## How to use this plan with Emergent/Replit

1. Start at `context/plan/00-execution-protocol.md`.
2. Execute tasks in `context/plan/01-master-task-registry.md` in ID order.
3. For each task, update status from `todo` to `doing` to `done`.
4. Do not start a task with unmet dependencies.
5. At end of each work session, update `context/plan/99-daily-run-log.md` with:
- last completed task ID
- next task ID
- blockers

## Phase order

1. Phase 0: Foundation and guardrails
2. Phase 1: Data model and content pipeline (text)
3. Phase 2: Quiz engine + adaptive SRS (core)
4. Phase 3: UX flows + dashboard + gamification (text-first)
5. Phase 4: Advanced text features + quality/hardening
6. Phase 5: Media expansion (audio/video/images) - last

## Files in this folder

- `00-execution-protocol.md`: strict run protocol for agents.
- `01-master-task-registry.md`: single source of truth for ordered tasks.
- `10-phase-0-foundation.md`
- `20-phase-1-data-and-content.md`
- `30-phase-2-quiz-and-srs.md`
- `40-phase-3-product-flows.md`
- `50-phase-4-hardening-and-release.md`
- `60-phase-5-media-expansion-last.md`
- `70-schema-and-api-contracts.md`
- `99-daily-run-log.md`

## Non-goals until Phase 5

- Pronunciation scoring
- Voice recognition
- Rich media stories
- Video lessons
- Heavy image content workflows
