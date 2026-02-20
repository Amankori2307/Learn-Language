# Phase 5 - Media Expansion (Only After Core Is Complete)

Objective: add optional audio/image/video enhancements without destabilizing text-first learning.

Hard rule:
- Do not start this phase before Phase 4 is fully complete.

## Entry criteria

- Production-ready text app already live and stable.
- Core retention metrics (accuracy, completion, 7-day retention) are tracked.

## Tasks

### P5-001 - Optional audio layer
Status: `todo`

Scope:
- Add audio asset model and storage references.
- Keep all audio optional and non-blocking.

Acceptance:
- If audio missing, user flow remains fully functional.

### P5-002 - Listen-based exercise mode
Status: `todo`

Scope:
- Add optional listening MCQ and listen->type practice.
- Feature-flag this mode.

Acceptance:
- Mode can be enabled/disabled without code changes.

### P5-003 - Image support for vocabulary hints
Status: `todo`

Scope:
- Attach optional image hint URLs.
- Lazy load images and provide alt text.

Acceptance:
- Images improve context but never block quiz completion.

### P5-004 - Video and long-form content support
Status: `todo`

Scope:
- Add optional short lesson clips by cluster.
- Keep video outside core session path.

Acceptance:
- Video is enrichment, not dependency for learning loop.

### P5-005 - Media compliance and cost controls
Status: `todo`

Scope:
- Storage quotas.
- Moderation workflow.
- CDN/cache policy.

Acceptance:
- Predictable operational costs and safe media handling.

## Exit criteria

- Core text experience remains fastest path.
- Media enhances learning but cannot degrade core retention flow.

