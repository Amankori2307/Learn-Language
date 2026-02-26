export type EnvTarget = "development" | "production";

export function resolveEnvFile(inputTarget?: string): string {
  const target = normalizeEnvTarget(inputTarget);
  if (target === "production") {
    return ".env.production";
  }
  return ".env.development";
}

export function normalizeEnvTarget(inputTarget?: string): EnvTarget {
  const normalized = String(inputTarget ?? "").trim().toLowerCase();
  if (normalized === "production" || normalized === "prod") {
    return "production";
  }
  if (normalized === "development" || normalized === "dev" || normalized === "local") {
    return "development";
  }
  return "development";
}
