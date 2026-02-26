import { runWithLifecycle } from "../common/logger/logger";
export type EnvTarget = "development" | "production";

export function resolveEnvFile(inputTarget?: string): string {
  return runWithLifecycle("resolveEnvFile", () => {
    const target = normalizeEnvTarget(inputTarget);
    if (target === "production") {
      return ".env.production";
    }
    return ".env.development";
  });
}

export function normalizeEnvTarget(inputTarget?: string): EnvTarget {
  return runWithLifecycle("normalizeEnvTarget", () => {
    const normalized = String(inputTarget ?? "").trim().toLowerCase();
    if (normalized === "production" || normalized === "prod") {
      return "production";
    }
    if (normalized === "development" || normalized === "dev" || normalized === "local") {
      return "development";
    }
    return "development";
  });
}
