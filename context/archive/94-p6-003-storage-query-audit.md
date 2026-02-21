# P6-003 Storage Query Audit

Objective: confirm learner-facing reads are consistently language-scoped and no fallback path leaks cross-language data.

## Audit checklist

| Area | Method/Route path | Language flow | Status |
|---|---|---|---|
| Words list | `getWords(limit, language)` + `/api/words` | route parser -> storage method | done |
| Clusters list | `getClusters(language)` + `/api/clusters` | route parser -> storage method | done |
| Cluster detail | `getCluster(id, language)` + `/api/clusters/:id` | route parser -> storage method | done |
| Quiz candidates | `getQuizCandidates(userId, ..., language)` + `/api/quiz/generate` | route parser -> storage method | done |
| Quiz distractors source | `getWords(500, language)` in quiz generation | route parser -> storage method | done |
| Stats | `getUserStats(userId, language)` + `/api/stats` | route parser -> storage method | done |
| Attempt history | `getUserAttemptHistory(userId, limit, language)` + `/api/attempts/history` | route parser -> storage method | done |
| Leaderboard | `getLeaderboard(window, limit, language)` + `/api/leaderboard` | route parser -> storage method | done |
| Submit answer edge path | `/api/quiz/submit` word fetch + examples | request now carries `language`; route enforces `word.language === language`; examples fetched with language | done |

## Fallback-path review

- Quiz generate fallback reseed path preserves requested language on retry.
- No learner route now intentionally falls back to mixed-language reads.
- Remaining unscoped methods are admin/internal and not used in learner-facing language-filtered paths.

## Outcome

- P6-003 acceptance criteria met:
  - query audit checklist exists with no unresolved learner-facing entries
  - endpoint handlers pass language through on scoped reads
