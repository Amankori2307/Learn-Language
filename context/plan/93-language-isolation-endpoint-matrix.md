# Language Isolation Endpoint Matrix (P6-001)

Objective: define exact `(userId, language)` behavior for learner-facing endpoints and assign test ownership.

## Rules

- Client rule: always send `language` for learner-facing requests.
- Server rule: never return cross-language progress/attempt/stat data for a user.
- Empty-state rule: if no data exists for selected language, return valid empty payload (not fallback from another language).

## Endpoint matrix

| Endpoint | Method | Language input | User input | Expected scoped behavior | Empty-state behavior | Test ownership |
|---|---|---|---|---|---|---|
| `/api/quiz/generate` | `GET` | query `language` | auth session user | candidate pool only from selected language; scoring/progress lookups limited to selected language | returns `[]` when no candidates in selected language | `server/storage.language-isolation.integration.test.ts` |
| `/api/stats` | `GET` | query `language` | auth session user | totals, mastery, weak count, streak/xp, direction metrics computed only from selected language words/attempts | returns zero/neutral stats object for selected language | `server/storage.language-isolation.integration.test.ts` |
| `/api/attempts/history` | `GET` | query `language` | auth session user | attempt list includes only attempts joined to selected language words | returns `[]` | `server/storage.language-isolation.integration.test.ts` |
| `/api/clusters` | `GET` | query `language` | auth session user | cluster list contains clusters with at least one approved word in selected language | returns `[]` | `server/storage.language-isolation.integration.test.ts` |
| `/api/clusters/:id` | `GET` | query `language` | auth session user | cluster detail keeps cluster metadata, but words list limited to selected language approved words | returns cluster with empty `words` array if no matching words | `server/storage.language-isolation.integration.test.ts` |
| `/api/leaderboard` | `GET` | query `language` | auth session user | rank/xp/accuracy computed from selected language attempts only, across selected window | returns `[]` if no attempts in selected language window | `server/storage.language-isolation.integration.test.ts`, `server/services/leaderboard.test.ts` |
| `/api/words` | `GET` | query `language` | auth session user | only approved words from selected language are returned | returns `[]` | `server/storage.language-isolation.integration.test.ts` |

## Implementation checklist

- [ ] Ensure every client hook sends `language` query param for learner-facing endpoints.
- [ ] Ensure every route parser reads `language` from contract input.
- [ ] Ensure every storage method receives `language` for learner-facing reads.
- [ ] Remove legacy unscoped fallback behavior in learner-facing code paths.
- [ ] Add integration tests from test ownership column.

## Notes for P6-002 and P6-003

- P6-002 will implement the new integration test file listed above.
- P6-003 will close the checklist and remove remaining unscoped fallback path(s), if any.
