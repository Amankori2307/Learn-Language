import type { Request, Response } from "express";
import { appLogger } from "./logger/logger";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type SuccessEnvelope<T> = {
  success: true;
  error: false;
  data: T;
  message: string;
  requestId: string;
  meta?: Record<string, unknown>;
};

export type ErrorEnvelope = {
  success: false;
  error: true;
  data: null;
  code: ErrorCode;
  message: string;
  details?: unknown;
  requestId: string;
};

export function getRequestId(req: Request): string {
  const requestId = (req as Request & { requestId?: string }).requestId;
  return requestId ?? "unknown";
}

export function sendError(
  req: Request,
  res: Response,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
) {
  const body: ErrorEnvelope = {
    success: false,
    error: true,
    data: null,
    code,
    message,
    requestId: getRequestId(req),
  };

  if (details !== undefined) {
    body.details = details;
  }

  return res.status(status).json(body);
}

export function sendSuccess<T>(
  req: Request,
  res: Response,
  data: T,
  message: string = "OK",
  meta?: Record<string, unknown>,
) {
  const body: SuccessEnvelope<T> = {
    success: true,
    error: false,
    data,
    message,
    requestId: getRequestId(req),
  };

  if (meta) {
    body.meta = meta;
  }

  return res.json(body);
}

export function logApiEvent(req: Request, event: string, payload: Record<string, unknown> = {}) {
  const entry = {
    requestId: getRequestId(req),
    event,
    ts: new Date().toISOString(),
    ...payload,
  };

  appLogger.info("[api-event]", entry);
}
