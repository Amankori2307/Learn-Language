import { createLogger, format, transports, type transport } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import type { NextFunction, Request, Response } from "express";
import { isProductionEnv } from "../../config/env.runtime";
import { getRuntimeEnv } from "../../config/env.runtime";
import fs from "fs";

const runtimeEnv = getRuntimeEnv();
const isProduction = isProductionEnv();
const REDACTED = "[redacted]";
const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|set-cookie|token|secret|password|api[-_]?key/i;

export function redactLogValue(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEY_PATTERN.test(key)) {
    return REDACTED;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactLogValue(entry));
  }

  if (value && typeof value === "object") {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactLogValue(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

export function safeJsonStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  return JSON.stringify(value, (_key, currentValue: unknown) => {
    if (currentValue && typeof currentValue === "object") {
      if (seen.has(currentValue as object)) {
        return "[circular]";
      }
      seen.add(currentValue as object);
    }
    return currentValue;
  });
}

const sanitizeLogFormat = format((info) => {
  Object.entries(info).forEach(([key, value]) => {
    info[key] = redactLogValue(value, key);
  });
  return info;
});

const logLevel = runtimeEnv.APP_LOG_LEVEL?.trim() || (isProduction ? "info" : "debug");
const loggerTransports: transport[] = [new transports.Console()];

if (runtimeEnv.APP_LOG_DIR?.trim()) {
  const logDir = runtimeEnv.APP_LOG_DIR.trim();
  fs.mkdirSync(logDir, { recursive: true });
  loggerTransports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: "backend-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: runtimeEnv.APP_LOG_RETENTION_DAYS
        ? `${runtimeEnv.APP_LOG_RETENTION_DAYS}d`
        : "14d",
      maxSize: runtimeEnv.APP_LOG_MAX_SIZE ?? "20m",
      zippedArchive: true,
      level: logLevel,
      handleExceptions: true,
    }),
  );
}

export const appLogger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    sanitizeLogFormat(),
    format.printf(({ level, message, timestamp, stack, ...meta }) => {
      return safeJsonStringify({
        timestamp,
        level,
        message,
        ...(stack ? { stack } : {}),
        ...meta,
      });
    }),
  ),
  transports: loggerTransports,
});

function getUserId(req: Request): string | null {
  const user = req.user as { claims?: { sub?: string } } | undefined;
  return user?.claims?.sub ?? null;
}

export function buildHttpRequestLogEntry(req: Request, res: Response, durationMs: number) {
  const requestId = (req as Request & { requestId?: string }).requestId ?? "unknown";
  return {
    event: "http.request.completed",
    requestId,
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    statusCode: res.statusCode,
    durationMs: Number(durationMs.toFixed(2)),
    contentLength: res.getHeader("content-length") ?? null,
    userId: getUserId(req),
    ip: req.ip,
  };
}

export function httpRequestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();
  const requestId = (req as Request & { requestId?: string }).requestId ?? "unknown";

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    appLogger.info("http.request.completed", buildHttpRequestLogEntry(req, res, durationMs));
  });

  res.on("close", () => {
    if (res.writableEnded) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    appLogger.warn("http.request.aborted", {
      event: "http.request.aborted",
      requestId,
      method: req.method,
      path: req.path,
      url: req.originalUrl,
      durationMs: Number(durationMs.toFixed(2)),
      userId: getUserId(req),
      ip: req.ip,
    });
  });

  next();
}
