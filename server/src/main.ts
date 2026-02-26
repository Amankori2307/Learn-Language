import "reflect-metadata";
import express, { type Express } from "express";
import path from "path";
import { pathToFileURL } from "url";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService, type ConfigType } from "@nestjs/config";
import { type INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";
import { setupAuth } from "./modules/auth";
import { authConfig } from "./config/auth.config";
import { randomUUID } from "crypto";
import { appLogger, httpRequestLogger } from "./common/logger/logger";
import { NestAppLogger } from "./common/logger/nest-app-logger";

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

async function bootstrap() {
  const { app } = await createNestApiApp();
  const port = Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 5001);
  await app.listen(port);
  appLogger.info(`[nest-api] Backend API listening on http://localhost:${port}`);
}

export async function createNestApiApp(): Promise<{
  app: INestApplication;
  expressApp: Express;
}> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(new NestAppLogger());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);
  const resolvedAuthConfig = configService.getOrThrow<ConfigType<typeof authConfig>>("auth");
  const allowedOrigins = resolveAllowedOrigins(process.env.FRONTEND_ORIGINS);

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Request-Id"],
  });

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.use((req, res, next) => {
    const incomingRequestId = req.headers["x-request-id"];
    const requestId = typeof incomingRequestId === "string" && incomingRequestId.trim().length > 0
      ? incomingRequestId
      : randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
  });
  expressApp.use(httpRequestLogger);
  expressApp.use(
    "/audio/generated",
    express.static(path.join(process.cwd(), "assets/audio")),
  );

  if (!resolvedAuthConfig.jwtSecret) {
    throw new Error("Invalid environment configuration: JWT_SECRET is required for auth setup");
  }
  if (resolvedAuthConfig.provider === "google" && !resolvedAuthConfig.googleClientId) {
    throw new Error("Invalid environment configuration: GOOGLE_CLIENT_ID is required for google auth");
  }

  await setupAuth(expressApp, {
    provider: resolvedAuthConfig.provider,
    googleClientId: resolvedAuthConfig.googleClientId,
    googleClientSecret: resolvedAuthConfig.googleClientSecret,
    googleIssuerUrl: resolvedAuthConfig.googleIssuerUrl,
    frontendBaseUrl: resolvedAuthConfig.frontendBaseUrl,
    jwtSecret: resolvedAuthConfig.jwtSecret,
    reviewerEmails: resolvedAuthConfig.reviewerEmails,
    adminEmails: resolvedAuthConfig.adminEmails,
  });

  return { app, expressApp };
}

const isDirectExecution =
  Boolean(process.argv[1]) &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  process.on("unhandledRejection", (reason: unknown) => {
    appLogger.error(`[UnhandledRejection] Reason: ${String(reason)}`);
  });

  process.on("uncaughtException", (error: Error) => {
    appLogger.error(`[UncaughtException] Error: ${error.message}`, { stack: error.stack });
    process.exit(1);
  });

  void bootstrap().catch((error) => {
    appLogger.error("Failed to start backend API server", { error });
    process.exit(1);
  });
}
