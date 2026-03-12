# Observability

This document defines the current logging shape, request correlation behavior, and redaction rules for backend observability.

## Goals

- all backend logs flow through Winston
- every HTTP request can be correlated by `requestId`
- request logs are structured rather than free-form text
- sensitive values are redacted before logging
- Nest bootstrap logs and application logs use one common output format

## Current logging surfaces

Primary implementation files:

- [logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/logger.ts)
- [nest-app-logger.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/common/logger/nest-app-logger.ts)
- [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts)

## Structured log shape

Backend logs now serialize as JSON lines with these standard top-level fields:

- `timestamp`
- `level`
- `message`

Additional fields vary by event, for example:

- `requestId`
- `event`
- `method`
- `path`
- `url`
- `statusCode`
- `durationMs`
- `userId`
- `ip`
- `context`
- `stack`

## Request correlation

`requestId` is assigned in [main.ts](/Users/aman/Projects/personal-projects/Learn-Language/server/src/main.ts) from:

1. incoming `x-request-id` when present
2. generated UUID otherwise

The same value is returned in the response header and included in:

- success envelopes
- error envelopes
- request completion logs
- many application logs that already propagate request context

## Request lifecycle events

HTTP request logging now emits structured events through the shared logger:

- `http.request.completed`
- `http.request.aborted`

Current request-completion fields:

- `event`
- `requestId`
- `method`
- `path`
- `url`
- `statusCode`
- `durationMs`
- `contentLength`
- `userId`
- `ip`

## Redaction rules

The shared logger redacts keys matching these sensitive categories:

- `authorization`
- `cookie`
- `set-cookie`
- `token`
- `secret`
- `password`
- `apiKey` / `api-key`

Redaction is recursive across nested objects and arrays.

Redacted values are replaced with:

```txt
[redacted]
```

## Current scope

Implemented today:

- shared JSON log formatting
- shared recursive redaction
- structured HTTP request completion and abort logging
- removal of the remaining `console.error` fallback in auth controller error handling
- focused logger tests for redaction, circular-safe serialization, and request metadata extraction

Operational considerations:

- request lifecycle logging currently focuses on completion and abort events
- module-level log field conventions are not yet fully standardized across every service and repository
- transport behavior is still centered on the current logger setup and should be revisited only if new transports are introduced
