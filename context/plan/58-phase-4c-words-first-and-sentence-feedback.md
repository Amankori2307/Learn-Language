# Phase 4C - Words First, Sentences in Feedback

Objective: keep learning prompts word-first, and use sentences only as post-answer reinforcement.

## Improved implementation prompt/spec

Build a text-first source language learning flow where:

1. Quiz prompts are word/phrase only.
2. Sentence content is not used as primary question prompt in this phase.
3. After user selects an option, feedback must include one sentence example triplet:
   - `sentence` (source language)
   - `pronunciation` (English transliteration for that sentence)
   - `meaning` (English translation)
4. This example triplet must be stored and served from structured data (`word_examples`), not ad-hoc UI strings.
5. If example data is missing, server should provide a safe fallback triplet to avoid blank feedback UI.

Out of scope for this phase:
- audio/video/image-first experiences
- sentence-only quiz modes as primary prompts

## Task breakdown

### P4C-001 - Finalize words-first spec
Status: `done`

Acceptance:
- Scope and behavior are clear and testable.
- Prompt explicitly separates word prompt flow vs sentence feedback flow.

### P4C-002 - Persist example pronunciation in data model
Status: `done`

Scope:
- Add sentence pronunciation field in `word_examples`.
- Ensure importer reads `examples[].pronunciation` into DB.
- If row already exists, keep it updated (idempotent upsert behavior).

Acceptance:
- Each example row can represent sentence + pronunciation + meaning.

### P4C-003 - Word-only question generation
Status: `done`

Scope:
- Restrict quiz generation to:
  - `source_to_target`
  - `target_to_source`
- Do not generate sentence/fill-blank prompt types in this phase.

Acceptance:
- Question text is always word/phrase-centered.

### P4C-004 - Example triplet guarantee in submit response
Status: `done`

Scope:
- Submit response returns example payload with:
  - sentence text
  - sentence pronunciation
  - sentence meaning
- Add fallback triplet when no DB example exists.

Acceptance:
- Feedback contract never leaves the example section blank.

### P4C-005 - Feedback UI rendering update
Status: `done`

Scope:
- Show three explicit rows:
  - Sentence
  - Pronunciation
  - Meaning
- Keep readable in light/dark modes.

Acceptance:
- User can always see correct result + full example triplet clearly.

### P4C-006 - Tests and docs
Status: `done`

Scope:
- Update/add tests for:
  - generation modes
  - submit payload shape with example triplet
  - UI feedback block rendering
- Update app context docs.

Acceptance:
- Behavior is guarded by automated checks and documented.
