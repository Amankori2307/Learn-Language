import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REPL_ID: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  ISSUER_URL: z.string().url().default("https://replit.com/oidc"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const config = parsed.data;

export function getAuthConfig() {
  if (!config.REPL_ID) {
    throw new Error("Invalid environment configuration: REPL_ID is required for auth setup");
  }
  if (!config.SESSION_SECRET) {
    throw new Error("Invalid environment configuration: SESSION_SECRET is required for auth setup");
  }

  return {
    REPL_ID: config.REPL_ID,
    SESSION_SECRET: config.SESSION_SECRET,
    ISSUER_URL: config.ISSUER_URL,
    DATABASE_URL: config.DATABASE_URL,
  };
}
