import { registerAs } from "@nestjs/config";

export const nestAppConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 5001),
  authProvider: "google" as const,
}));
