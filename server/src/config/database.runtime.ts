import { z } from "zod";
import { getRuntimeEnv } from "./env.runtime";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

let cachedDatabaseEnv: DatabaseEnv | null = null;

export function getDatabaseRuntimeEnv(): DatabaseEnv {
  if (!cachedDatabaseEnv) {
    const env = getRuntimeEnv();
    const parsed = databaseEnvSchema.safeParse(env);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid database environment configuration: ${message}`);
    }
    cachedDatabaseEnv = parsed.data;
  }

  return cachedDatabaseEnv;
}
