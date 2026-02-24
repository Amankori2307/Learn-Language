import { validateEnv, type EnvConfig } from "./env.validation";

let cachedEnv: EnvConfig | null = null;

export function getRuntimeEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
}
