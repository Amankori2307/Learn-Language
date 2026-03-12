import { registerAs } from "@nestjs/config";
import { UserTypeEnum } from "@shared/domain/enums";
import { getRuntimeEnv } from "./env.runtime";

function parseEmailList(value?: string): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const authConfig = registerAs("auth", () => {
  const env = getRuntimeEnv();
  return {
    provider: "google" as const,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    googleIssuerUrl: env.GOOGLE_ISSUER_URL ?? "https://accounts.google.com",
    frontendBaseUrl: env.FRONTEND_BASE_URL,
    jwtSecret: env.JWT_SECRET,
    reviewerEmails: parseEmailList(env.REVIEWER_EMAILS),
    adminEmails: parseEmailList(env.ADMIN_EMAILS),
  };
});

export function resolveRoleFromEmailFromConfig(
  email: string | null | undefined,
  input: {
    reviewerEmails: Set<string>;
    adminEmails: Set<string>;
  },
): UserTypeEnum {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return UserTypeEnum.LEARNER;
  }

  if (input.adminEmails.has(normalized)) {
    return UserTypeEnum.ADMIN;
  }

  if (input.reviewerEmails.has(normalized)) {
    return UserTypeEnum.REVIEWER;
  }

  return UserTypeEnum.LEARNER;
}
