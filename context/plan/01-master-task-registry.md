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
| P6-028 | done | Redesign Clusters page into list/table view with search, filters, sort controls, and pagination | - | M | clusters page supports text search, type/language filters, sortable columns (name, type, wordCount), paginated results with stable query params, and empty/loading states in both light/dark themes |
| P6-024 | done | Standardize Part of Speech with backend enum and searchable dropdown in vocabulary forms | P6-023 | M | backend uses `PartOfSpeechEnum` for validation/storage contracts, UI uses searchable select (not free-text) in add/review vocab flows, and existing seed/import paths map cleanly to enum values |
| P6-025 | done | Standardize Tags with enum-backed selectable options and searchable multi-select (aligned with cluster UX where appropriate) | P6-024 | M | backend validates tags via enum (or controlled registry), UI supports searchable multi-select for tags, tags-vs-clusters distinction is documented/enforced, and invalid free-text tags are blocked |
| P6-022 | done | Maintain zero-warning lint baseline and prevent regressions across new PRs | - | S | `pnpm run lint` remains warning-free with `--max-warnings=0`; guideline rule is enforced and no warning-level lint rules are reintroduced |

## Phase 5 - Media expansion (deferred)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | done | Add optional audio URL support end-to-end (non-blocking) | P6-013 | M | text flow still works when audio is missing |
| P5-002 | done | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | done | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |

## Phase 7 - Runtime reliability and test expansion (active)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P7-001 | done | Add explicit `.env` runtime controls for feedback email transport and hybrid quiz audio behavior (local + docker parity) | - | S | `.env` and `docker-compose.yml` include required email/audio runtime keys, server/client read them safely, and app has deterministic behavior when values are missing |
| P7-002 | done | Validate all quiz modes end-to-end and close behavior gaps (`daily_review`, `new_words`, `cluster`, `weak_words`, `listen_identify`, `complex_workout`) | P7-001 | M | every mode can start from UI, generate valid question set, submit answers, and complete flow without dead CTAs or broken navigation |
| P7-003 | done | Build comprehensive automated testing pyramid (unit + integration + UI + smoke E2E) and wire into single CI gate | P7-002 | L | baseline suites exist per layer, core learning/review/auth/audio/feedback flows are covered, and CI blocks on failures with stable test commands |
| P7-004 | blocked | Migrate backend runtime to Next.js and refactor codebase into domain modules (auth, quiz, review, analytics, vocabulary, media, infra) | P7-003 | XL | Next.js app router/API routes fully replace Express server, domain modules own handlers/services/schemas/tests, cross-module contracts are explicit, and docker/dev/prod parity is preserved |

## Phase 8 - Functionality-first product hardening (active)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P8-001 | done | Enforce architecture boundary: separate UI rendering layer from feature logic/state so UI library can be swapped with minimal rewrite | - | L | feature logic moves into hooks/services/view-model modules, UI components become mostly presentational, no business logic in UI primitives, and at least dashboard/quiz/analytics follow this split |
| P8-002 | done | Remove magic numbers repo-wide and replace with named constants/enums (timeouts, page sizes, thresholds, limits, scoring weights) | P8-001 | M | no unexplained numeric literals in app logic; constants live in module/shared constants files; lint/tests pass; guideline updated and followed in touched modules |
| P8-003 | done | Normalize placement of interfaces/enums/constants: keep them out of controllers/services/repositories and place by domain ownership | P8-001 | M | interfaces/enums/constants are colocated in `shared/domain/*` or module-level `types/constants` files; controller/service/repository files only import and use them |
| P8-004 | done | Sidebar UX cleanup (declutter IA, grouping, labels, spacing, visual hierarchy, responsive behavior) | P8-001 | M | sidebar has reduced clutter, clear primary/secondary groups, consistent spacing/icons, active state clarity, and no overflow issues on common laptop widths |
| P8-005 | done | Expand high-confidence seed content (new words + linked sentences) using current seed correctness rules | P8-002 | M | `words.json` and `sentences.json` both grow with unique entries; each new word has >=2 linked sentences; validator + single-source checks pass |
| P8-007 | done | Enable SSR path for performance-critical pages and measure impact | P8-001 | L | selected pages render server-side, client hydration works, key metrics improve (TTFB/LCP for targeted routes), and behavior parity remains |
| P8-008 | done | Audio generation pipeline with Google Cloud Text-to-Speech + cache: play existing audio first, synthesize/store when missing | P8-003 | L | quiz audio resolver checks stored `audioUrl` first; missing assets trigger GCP TTS generation, persisted for reuse, with retry/error handling and cost-safe controls |
| P8-006 | todo | Production deploy + CI/CD pipeline (build/test/deploy) with environment strategy and rollback path | P8-002,P8-003,P8-004,P8-005,P8-007,P8-008 | L | app is deployed to a stable URL, pipeline runs lint/test/build on push, deploys on main, and docs include env setup + rollback steps |
