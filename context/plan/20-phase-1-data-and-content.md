# Phase 1 - Core Foundations (MVP Text Learning)

Objective: deliver minimum product with structured lexical data, clusters, reverse practice, and basic progress.

Maps to conversation chunks:
- Content model
- Flashcard engine
- Basic user progress
- Cluster support
- Reverse practice

## Entry criteria

- Phase 0 complete.

## Tasks

### P1-001 - Core lexical data model
Status: `done`

Scope:
- Word/phrase base fields.
- Translation, transliteration, part-of-speech.
- Difficulty and frequency score.
- CEFR/level tags where available.

Acceptance:
- CRUD-safe schema deployed.
- Data contract documented in `70-schema-and-api-contracts.md`.

### P1-002 - DB indexes for quiz/review
Status: `done`

Scope:
- Add index for due-review lookups on user progress.
- Add index for user attempt history scans.
- Add index to optimize cluster-word joins.

Acceptance:
- Index definitions exist in schema and are ready for DB push.

### P1-003 - Content import format (CSV/JSON)
Status: `done`

Scope:
- Define canonical input format for text content ingestion.
- Validate required fields and sanitize malformed entries.
- Upsert vocabulary content without duplicating rows.

Acceptance:
- Import script can load validated content in bulk.

### P1-004 - Text dataset expansion
Status: `done`

Scope:
- Expand seeded content to MVP target.
- Ensure each word has context/examples in normalized structure.

Acceptance:
- Target dataset reached: 300 words, 20 clusters, 100 sentences.

### P1-005 - Content quality checks
Status: `done`

Scope:
- Detect duplicate lexical items and cluster links.
- Validate transliteration formatting conventions.
- Report missing/low-quality example coverage.

Acceptance:
- Quality report is generated and clean before import/seed completion.

## Exit criteria

- End-to-end quiz can run in both directions using text-only content.
- User progress updates for every attempt.
