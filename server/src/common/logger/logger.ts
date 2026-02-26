import { createLogger, format, transports } from "winston";
import morgan from "morgan";
import type { Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const appLogger = createLogger({
  level: isProduction ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const details = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
      const errorStack = stack ? `\n${stack}` : "";
      return `${timestamp} [${level}] ${message}${details}${errorStack}`;
    }),
  ),
  transports: [new transports.Console()],
});

export const httpRequestLogger = morgan(
  (tokens, req: Request, res: Response) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length") ?? "-",
      "-",
      `${tokens["response-time"](req, res)} ms`,
      `reqId=${(req as Request & { requestId?: string }).requestId ?? "unknown"}`,
    ].join(" ");
  },
  {
    stream: {
      write: (message: string) => appLogger.info(message.trim()),
    },
  },
);

export function runWithLifecycle<T>(functionName: string, fn: () => T): T {
  const startedAt = Date.now();
  appLogger.debug("function.start", { functionName });

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then((resolved) => {
          appLogger.debug("function.end", {
            functionName,
            durationMs: Date.now() - startedAt,
          });
          return resolved;
        })
        .catch((error: unknown) => {
          appLogger.error("function.error", {
            functionName,
            durationMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }) as T;
    }

    appLogger.debug("function.end", {
      functionName,
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    appLogger.error("function.error", {
      functionName,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
