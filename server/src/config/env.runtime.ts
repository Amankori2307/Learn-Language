import { validateEnv, type EnvConfig } from "./env.validation";
import { config as loadEnv } from "dotenv";

let cachedEnv: EnvConfig | null = null;

export function getRuntimeEnv(): EnvConfig {
  if (!cachedEnv) {
    loadEnv();
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
}
