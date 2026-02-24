import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_PROVIDER: z.enum(["google", "dev"]).default("google"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().min(16).optional(),
  GOOGLE_ISSUER_URL: z.string().url().default("https://accounts.google.com"),
  REVIEWER_EMAILS: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  FEEDBACK_EMAIL_TO: z.string().email().default("amankori2307@gmail.com"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Learn Language <no-reply@learn-language.local>"),
  ENABLE_GCP_TTS: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  GOOGLE_TTS_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return parsed.data;
}
