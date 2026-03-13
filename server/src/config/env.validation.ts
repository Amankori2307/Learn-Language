import { z } from "zod";

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    BACKEND_PORT: z.coerce.number().int().positive().default(5001),
    BACKEND_HOST: z.string().optional(),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    AUTH_PROVIDER: z.literal("google").default("google"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    JWT_SECRET: z.string().min(16).optional(),
    GOOGLE_ISSUER_URL: z.string().url().default("https://accounts.google.com"),
    FRONTEND_BASE_URL: z.string().url().optional(),
    FRONTEND_ORIGINS: z.string().optional(),
    REVIEWER_EMAILS: z.string().optional(),
    ADMIN_EMAILS: z.string().optional(),
    APP_LOG_DIR: z.string().optional(),
    APP_LOG_LEVEL: z.string().optional(),
    APP_LOG_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
    APP_LOG_MAX_SIZE: z.string().optional(),
    ENABLE_GCP_TTS: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    GOOGLE_TTS_API_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const requireAuthSecrets = data.NODE_ENV === "production" && data.AUTH_PROVIDER === "google";

    if (requireAuthSecrets && !data.GOOGLE_CLIENT_ID?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GOOGLE_CLIENT_ID"],
        message: "GOOGLE_CLIENT_ID is required when AUTH_PROVIDER=google in production",
      });
    }

    if (requireAuthSecrets && !data.GOOGLE_CLIENT_SECRET?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GOOGLE_CLIENT_SECRET"],
        message: "GOOGLE_CLIENT_SECRET is required when AUTH_PROVIDER=google in production",
      });
    }

    if (requireAuthSecrets && !data.JWT_SECRET?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET is required when AUTH_PROVIDER=google in production",
      });
    }
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
