import { registerAs } from "@nestjs/config";
import { getRuntimeEnv } from "./env.runtime";

export const nestAppConfig = registerAs("app", () => {
  const env = getRuntimeEnv();
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    port: Number(env.BACKEND_PORT ?? env.PORT ?? 5001),
    host: env.BACKEND_HOST ?? "localhost",
    authProvider: "google" as const,
  };
});
