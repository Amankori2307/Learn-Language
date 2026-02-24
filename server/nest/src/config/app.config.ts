import { registerAs } from "@nestjs/config";

export const nestAppConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  authProvider: process.env.AUTH_PROVIDER ?? "google",
}));

