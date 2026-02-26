import { validateEnv, type EnvConfig } from "./env.validation";
import { config as loadEnv } from "dotenv";
import { resolveEnvFile } from "./env-files";

let cachedEnv: EnvConfig | null = null;

export function getRuntimeEnv(): EnvConfig {
  if (!cachedEnv) {
    loadEnv({ path: resolveEnvFile(process.env.APP_ENV ?? process.env.NODE_ENV) });
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
}
