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
| P6-020 | todo | Separate "Add Vocabulary" and "Review Vocabulary" into distinct pages/routes (no combined screen) | P6-013 | M | app has separate nav entries and routes for add vs review workflows, each page has a single clear primary action, and permissions remain enforced (reviewer/admin only) |
| P6-014 | todo | Improve "all words completed" learner UX: show clear completion state with quick actions for revision, weak-word drill, and cluster replay | P6-013 | M | when new-word queue is empty, learner sees a non-dead-end state with actionable buttons; revision modes open with valid session payload; no blank/no-data dead screen |
| P6-015 | todo | Split content source into `assets/processed/words.json` and `assets/processed/sentences.json`, with sentence-to-word linking for examples | P6-014 | L | importer/validator use two files, sentence schema includes `wordRefs` (or equivalent) and language/meaning/pronunciation, and word example rendering resolves only linked sentences |
| P6-016 | todo | Improve cluster experience: richer cluster catalog and per-cluster word counts in UI/API | P6-015 | M | clusters list includes count badges sourced from backend data, adds missing practical clusters, and learner can see cluster size before starting practice |
| P6-017 | todo | Upgrade quiz feedback panel to show multiple example sentences (word + pronunciation + meaning for each) | P6-015 | M | post-answer feedback renders multiple linked examples (not single-line only), layout remains readable in light/dark modes, and no Telugu-only sentence is shown without pronunciation/meaning |
| P6-018 | todo | Add learner analytics module for strengths/gaps by cluster, word, and category | P6-017 | L | dashboard shows top strengths, weak clusters/words, and trend indicators from attempts/progress; insights are language-scoped and backed by API endpoints/tests |
| P6-019 | todo | Pronunciation strategy decision note (non-implementation): evaluate sources for word/sentence pronunciation quality, cost, and licensing | P6-018 | S | plan doc added with options (manual reviewer text, transliteration rules, TTS fallback), tradeoffs, and recommended phased rollout; no runtime code changes |

## Phase 5 - Media expansion (deferred)

| ID | Status | Task | Depends On | Effort | Done When |
|---|---|---|---|---|---|
| P5-001 | done | Add optional audio URL support end-to-end (non-blocking) | P6-013 | M | text flow still works when audio is missing |
| P5-002 | done | Add optional listen-and-identify quiz mode | P5-001 | M | mode can be enabled/disabled cleanly |
| P5-003 | done | Add image hints for selected vocabulary groups | P5-001 | M | images lazy-load and degrade gracefully |
