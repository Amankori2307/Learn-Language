export type EnvTarget = "local" | "production";

export function resolveEnvFile(inputTarget?: string): string {
  const target = normalizeEnvTarget(inputTarget);
  if (target === "production") {
    return ".env.production";
  }
  return ".env.local";
}

export function normalizeEnvTarget(inputTarget?: string): EnvTarget {
  const normalized = String(inputTarget ?? "").trim().toLowerCase();
  if (normalized === "production" || normalized === "prod") {
    return "production";
  }
  return "local";
}
