import { validateEnv, type EnvConfig } from "./env.validation";
import { config as loadEnv } from "dotenv";
import { resolveEnvFile } from "./env-files";

let cachedEnv: EnvConfig | null = null;

export function getAppEnvName() {
  return process.env.APP_ENV ?? process.env.NODE_ENV;
}

export function getRuntimeEnvFilePath() {
  return resolveEnvFile(getAppEnvName());
}

export function getRuntimeEnv(): EnvConfig {
  if (!cachedEnv) {
    loadEnv({ path: getRuntimeEnvFilePath() });
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
}

export function isProductionEnv(): boolean {
  return getRuntimeEnv().NODE_ENV === "production";
}
