import "reflect-metadata";
import express, { type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService, type ConfigType } from "@nestjs/config";
import path from "path";
import { sendError } from "../common/http";
import { setupAuth } from "../modules/auth";
import { AppModule } from "../app.module";
import { authConfig } from "../config/auth.config";
import { databaseConfig } from "../config/database.config";

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

const DEFAULT_ALLOWED_FRONTEND_ORIGINS = [
  "http://localhost:3000",
  "https://learn-lang.amankori.me",
];

function resolveAllowedOrigins(rawOrigins?: string): Set<string> {
  const configured = (rawOrigins ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_FRONTEND_ORIGINS, ...configured]);
}

async function buildNestExpressApp() {
  const expressApp = express();
  const allowedOrigins = resolveAllowedOrigins(process.env.FRONTEND_ORIGINS);

  expressApp.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  expressApp.use(express.urlencoded({ extended: false }));
  expressApp.use(
    "/audio/generated",
    express.static(path.join(process.cwd(), "assets/audio")),
  );
  expressApp.use((req, res, next) => {
    const origin = req.headers.origin;
    if (typeof origin === "string" && allowedOrigins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, X-Request-Id",
      );
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    return next();
  });

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
  const configService = nestApp.get(ConfigService);
  const resolvedAuthConfig = configService.getOrThrow<ConfigType<typeof authConfig>>("auth");
  const resolvedDatabaseConfig = configService.getOrThrow<ConfigType<typeof databaseConfig>>("database");
  if (!resolvedAuthConfig.sessionSecret) {
    throw new Error("Invalid environment configuration: SESSION_SECRET is required for auth setup");
  }
  if (resolvedAuthConfig.provider === "google" && !resolvedAuthConfig.googleClientId) {
    throw new Error("Invalid environment configuration: GOOGLE_CLIENT_ID is required for google auth");
  }
  await setupAuth(expressApp, {
    provider: resolvedAuthConfig.provider,
    googleClientId: resolvedAuthConfig.googleClientId,
    googleClientSecret: resolvedAuthConfig.googleClientSecret,
    googleIssuerUrl: resolvedAuthConfig.googleIssuerUrl,
    sessionSecret: resolvedAuthConfig.sessionSecret,
    databaseUrl: resolvedDatabaseConfig.url,
    reviewerEmails: resolvedAuthConfig.reviewerEmails,
    adminEmails: resolvedAuthConfig.adminEmails,
  });
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

export async function startStandaloneNestApiServer(inputPort?: number) {
  const app = await getNestExpressApp();
  const resolvedPort =
    inputPort ??
    Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 5000);

  return await new Promise<import("http").Server>((resolve) => {
    const server = app.listen(resolvedPort, () => {
      log(`Backend API listening on http://localhost:${resolvedPort}`, "nest-api");
      resolve(server);
    });
  });
}
