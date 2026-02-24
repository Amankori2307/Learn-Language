import "reflect-metadata";
import express, { type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { sendError } from "../../../http";
import { setupAuth } from "../modules/auth";
import { AppModule } from "../app.module";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

function log(message: string, source = "next-api") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

async function buildNestExpressApp() {
  const expressApp = express();

  expressApp.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  expressApp.use(express.urlencoded({ extended: false }));

  expressApp.use((req, res, next) => {
    const requestId = req.get("x-request-id") ?? randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
  });

  expressApp.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json;
    res.json = function json(bodyJson, ...args) {
      capturedJsonResponse = bodyJson as Record<string, unknown>;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (!path.startsWith("/api")) {
        return;
      }

      let logLine = `[${req.requestId ?? "unknown"}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    });
    next();
  });

  const adapter = new ExpressAdapter(expressApp);
  const nestApp = await NestFactory.create(AppModule, adapter, {
    bodyParser: false,
  });
  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await setupAuth(expressApp);
  await nestApp.init();

  expressApp.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    const normalizedError = err as { status?: number; statusCode?: number; message?: string };
    const status = normalizedError.status ?? normalizedError.statusCode ?? 500;
    const message = normalizedError.message ?? "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      next(err);
      return;
    }

    sendError(req, res, status, "INTERNAL_ERROR", message);
  });

  return expressApp;
}

let nestExpressAppPromise: Promise<ReturnType<typeof express>> | null = null;

export async function getNestExpressApp() {
  if (!nestExpressAppPromise) {
    nestExpressAppPromise = buildNestExpressApp();
  }
  return nestExpressAppPromise;
}
