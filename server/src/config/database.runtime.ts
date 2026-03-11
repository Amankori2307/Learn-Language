import { config as loadEnv } from "dotenv";
import { z } from "zod";
import { resolveEnvFile } from "./env-files";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

let cachedDatabaseEnv: DatabaseEnv | null = null;

export function getDatabaseRuntimeEnv(): DatabaseEnv {
  if (!cachedDatabaseEnv) {
    loadEnv({ path: resolveEnvFile(process.env.APP_ENV ?? process.env.NODE_ENV) });
    const parsed = databaseEnvSchema.safeParse(process.env);
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
