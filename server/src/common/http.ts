import type { Request, Response } from "express";
import { appLogger, runWithLifecycle } from "./logger/logger";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export type ErrorEnvelope = {
  code: ErrorCode;
  message: string;
  details?: unknown;
  requestId: string;
};

export function getRequestId(req: Request): string {
  return runWithLifecycle("getRequestId", () => {
    const requestId = (req as Request & { requestId?: string }).requestId;
    return requestId ?? "unknown";
  });
}

export function sendError(
  req: Request,
  res: Response,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
) {
  return runWithLifecycle("sendError", () => {
    const body: ErrorEnvelope = {
      code,
      message,
      requestId: getRequestId(req),
    };

    if (details !== undefined) {
      body.details = details;
    }

    return res.status(status).json(body);
  });
}

export function logApiEvent(
  req: Request,
  event: string,
  payload: Record<string, unknown> = {},
) {
  return runWithLifecycle("logApiEvent", () => {
    const entry = {
      requestId: getRequestId(req),
      event,
      ts: new Date().toISOString(),
      ...payload,
    };

    appLogger.info("[api-event]", entry);
  });
}
