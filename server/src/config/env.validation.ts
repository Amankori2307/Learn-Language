import { z } from "zod";
import { runWithLifecycle } from "../common/logger/logger";

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    AUTH_PROVIDER: z.enum(["google", "dev"]).default("google"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    JWT_SECRET: z.string().min(16).optional(),
    GOOGLE_ISSUER_URL: z.string().url().default("https://accounts.google.com"),
    FRONTEND_BASE_URL: z.string().url().optional(),
    FRONTEND_ORIGINS: z.string().optional(),
    REVIEWER_EMAILS: z.string().optional(),
    ADMIN_EMAILS: z.string().optional(),
    ENABLE_GCP_TTS: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    GOOGLE_TTS_API_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.AUTH_PROVIDER !== "google") {
      return;
    }

    if (!data.GOOGLE_CLIENT_ID?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GOOGLE_CLIENT_ID"],
        message: "GOOGLE_CLIENT_ID is required when AUTH_PROVIDER=google",
      });
    }

    if (!data.GOOGLE_CLIENT_SECRET?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GOOGLE_CLIENT_SECRET"],
        message: "GOOGLE_CLIENT_SECRET is required when AUTH_PROVIDER=google",
      });
    }

    if (!data.JWT_SECRET?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET is required when AUTH_PROVIDER=google",
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  return runWithLifecycle("validateEnv", () => {
    const parsed = envSchema.safeParse(config);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid environment configuration: ${message}`);
    }

    return parsed.data;
  });
}
