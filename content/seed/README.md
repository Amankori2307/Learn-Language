# Content Import Format

Supported formats:
- JSON array (`.json`)
- CSV (`.csv`)

## JSON shape

Each row:
- `telugu` (required)
- `transliteration` (required)
- `english` (required)
- `partOfSpeech` (required)
- `difficulty` (optional, default `1`)
- `difficultyLevel` (optional: `beginner|easy|medium|hard`)
- `frequencyScore` (optional `0..1`, default `0.5`)
- `cefrLevel` (optional)
- `tags` (optional string array)
- `clusters` (optional string array)
- `examples` (optional array of `{ telugu, english, contextTag?, difficulty? }`)

## CSV columns

`telugu,transliteration,english,partOfSpeech,difficulty,difficultyLevel,frequencyScore,cefrLevel,clusters,tags,exampleTelugu,exampleEnglish,contextTag,exampleDifficulty`

List fields (`clusters`, `tags`) use `|` separator.

## Commands

- Validate: `npm run content:validate -- content/seed/words.sample.json`
- Import: `npm run content:import -- content/seed/words.sample.json`

## MVP dataset workflow

- Generate + validate full MVP dataset: `npm run content:prepare:mvp`
- Import full MVP dataset: `npm run content:import:mvp`

Note:
- Import commands require `DATABASE_URL` to be set.
