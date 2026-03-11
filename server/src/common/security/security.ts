import type { ErrorRequestHandler, Request, RequestHandler, Response } from "express";
import type { ErrorCode } from "../http";
import { sendError } from "../http";
import { AppError } from "../errors/app-error";
import { appLogger } from "../logger/logger";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

type RateLimitRule = {
  key: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientAddress(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0]?.trim() ?? "unknown";
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

export function resetRateLimitStoreForTests() {
  rateLimitStore.clear();
}

export const securityHeadersMiddleware: RequestHandler = (_req, res, next) => {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
};

export const noStoreMiddleware: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

export function createRateLimitMiddleware(rule: RateLimitRule): RequestHandler {
  return (req, res, next) => {
    if (req.method === "OPTIONS") {
      next();
      return;
    }

    const now = Date.now();
    const clientAddress = getClientAddress(req);
    const storeKey = `${rule.key}:${clientAddress}`;
    const existing = rateLimitStore.get(storeKey);
    const activeEntry =
      existing && existing.resetAt > now
        ? existing
        : {
            count: 0,
            resetAt: now + rule.windowMs,
          };

    activeEntry.count += 1;
    rateLimitStore.set(storeKey, activeEntry);

    const remaining = Math.max(0, rule.maxRequests - activeEntry.count);
    const resetInSeconds = Math.max(1, Math.ceil((activeEntry.resetAt - now) / 1000));

    res.setHeader("X-RateLimit-Limit", String(rule.maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(activeEntry.resetAt / 1000)));

    if (activeEntry.count > rule.maxRequests) {
      res.setHeader("Retry-After", String(resetInSeconds));
      sendError(
        req,
        res,
        429,
        "RATE_LIMITED",
        rule.message ?? "Too many requests. Please try again later.",
      );
      return;
    }

    next();
  };
}

function resolveErrorResponse(error: unknown): {
  status: number;
  code: ErrorCode;
  message: string;
  logMessage: string;
  details?: unknown;
} {
  if (error instanceof AppError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
      logMessage: "app.error",
    };
  }

  if (error instanceof Error && error.message.includes("is not allowed by CORS")) {
    return {
      status: 403,
      code: "FORBIDDEN",
      message: "Origin is not allowed",
      logMessage: "cors.reject",
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Internal Server Error",
    logMessage: "unhandled.request.error",
  };
}

export const expressErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const resolved = resolveErrorResponse(error);
  appLogger.error(resolved.logMessage, {
    requestId: req.requestId ?? "unknown",
    method: req.method,
    path: req.path,
    status: resolved.status,
    code: resolved.code,
    error,
  });

  sendError(req, res, resolved.status, resolved.code, resolved.message, resolved.details);
};

export function setStaticAssetSecurityHeaders(res: Response) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
}
