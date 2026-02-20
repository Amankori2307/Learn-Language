import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_PROVIDER: z.enum(["google", "dev"]).default("google"),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  GOOGLE_ISSUER_URL: z.string().url().default("https://accounts.google.com"),
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
  if (!config.SESSION_SECRET) {
    throw new Error("Invalid environment configuration: SESSION_SECRET is required for auth setup");
  }

  if (config.AUTH_PROVIDER === "google" && !config.GOOGLE_CLIENT_ID) {
    throw new Error("Invalid environment configuration: GOOGLE_CLIENT_ID is required for google auth");
  }

  return {
    AUTH_PROVIDER: config.AUTH_PROVIDER,
    CLIENT_ID: config.AUTH_PROVIDER === "google" ? config.GOOGLE_CLIENT_ID : undefined,
    CLIENT_SECRET: config.AUTH_PROVIDER === "google" ? config.GOOGLE_CLIENT_SECRET : undefined,
    SESSION_SECRET: config.SESSION_SECRET,
    ISSUER_URL: config.AUTH_PROVIDER === "google" ? config.GOOGLE_ISSUER_URL : undefined,
    DATABASE_URL: config.DATABASE_URL,
  };
}
