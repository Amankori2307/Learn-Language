# Master Task Registry (Active Only)

Status legend: `todo` | `doing` | `blocked`

Only active and pending tasks are listed here. Completed tasks are intentionally removed.

## Immediate Phase 6 extension

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P6-012 | done | Context hygiene pass: keep only essential active docs in `context/plan` and make `APP_CONTEXT.md` the execution source of truth | P6-011 | S | `context/plan` has only active docs, completed phase docs are archived, and `APP_CONTEXT.md` reflects current architecture/features/workflows/constraints |
| P6-013 | done | Add reviewer/admin "Create Vocabulary" flow (UI + API) that inserts entries directly into normal review lifecycle (draft/pending_review only) | P6-008 | M | reviewer/admin can submit vocab with language/source/pronunciation/meaning/POS/examples, entry appears in review queue with audit metadata, and learner flows remain approval-gated |

## Immediate Phase 6 extension - active

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P6-027 | todo | Redesign clusters UI + replace generic imported descriptions with meaningful learner-facing copy | P6-026 | M | cluster cards have clearer visual hierarchy and better scanability, descriptions are useful (no "imported cluster" filler text), and each cluster communicates practical learning value |
| P6-026 | todo | Fix "Start Reinforcement Loop" CTA from quiz completion so it always starts a valid weak-words session | P6-023 | S | clicking reinforcement CTA navigates correctly, loads weak-words quiz items (or explicit non-broken fallback UI), and works after both correct-heavy and incorrect-heavy sessions |
| P6-024 | todo | Standardize Part of Speech with backend enum and searchable dropdown in vocabulary forms | P6-023 | M | backend uses `PartOfSpeechEnum` for validation/storage contracts, UI uses searchable select (not free-text) in add/review vocab flows, and existing seed/import paths map cleanly to enum values |
| P6-025 | todo | Standardize Tags with enum-backed selectable options and searchable multi-select (aligned with cluster UX where appropriate) | P6-024 | M | backend validates tags via enum (or controlled registry), UI supports searchable multi-select for tags, tags-vs-clusters distinction is documented/enforced, and invalid free-text tags are blocked |
| P6-023 | todo | Fix post-session CTA on quiz completion screen: replace stale "Start Daily Review" label with next-step recommendation and ensure CTA route works | P6-022 | S | after finishing daily review, primary CTA text reflects next logical flow (not stale "Start Daily Review"), CTA navigates to a working route/session, and user is never stuck with only "Back to Dashboard" |
| P6-022 | todo | Maintain zero-warning lint baseline and prevent regressions across new PRs | - | S | `pnpm run lint` remains warning-free with `--max-warnings=0`; guideline rule is enforced and no warning-level lint rules are reintroduced |

## Phase 5 - Media expansion (deferred)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | done | Add optional audio URL support end-to-end (non-blocking) | P6-013 | M | text flow still works when audio is missing |
| P5-002 | done | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | done | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
