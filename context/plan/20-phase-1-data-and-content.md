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
Status: `doing`

Scope:
- Word/phrase base fields.
- Translation, transliteration, part-of-speech.
- Difficulty and frequency score.
- CEFR/level tags where available.

Acceptance:
- CRUD-safe schema deployed.
- Data contract documented in `70-schema-and-api-contracts.md`.

### P1-002 - Context and examples model
Status: `todo`

Scope:
- Example sentences with Telugu/English pairs.
- Context tags (travel, food, greetings, etc.).
- Basic synonyms/antonyms fields (optional in MVP, nullable).

Acceptance:
- Every seeded word has at least one example sentence.

### P1-003 - User progress (basic)
Status: `todo`

Scope:
- Track last seen, correct count, incorrect count.
- Store attempt log baseline fields (timestamp, result, direction).

Acceptance:
- After each question, progress state is persisted and retrievable.

### P1-004 - Cluster taxonomy
Status: `todo`

Scope:
- Beginner/Easy/Medium/Hard.
- Frequency-based clusters.
- Functional clusters (travel, food, daily-use).

Acceptance:
- User can fetch and practice by cluster.

### P1-005 - Reverse practice modes
Status: `todo`

Scope:
- Telugu -> English.
- English -> Telugu.
- Direction metadata logged per attempt.

Acceptance:
- Both directions available in quiz generation.

### P1-006 - Text dataset expansion
Status: `todo`

Scope:
- Increase seed content toward MVP size.
- Quality checks for duplicates and missing translations.

Acceptance:
- Target dataset reached: 300 words, 20 clusters, 100 sentences.

## Exit criteria

- End-to-end quiz can run in both directions using text-only content.
- User progress updates for every attempt.
