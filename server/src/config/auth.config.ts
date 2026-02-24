import { registerAs } from "@nestjs/config";
import { UserTypeEnum } from "@shared/domain/enums";

function parseEmailList(value?: string): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const authConfig = registerAs("auth", () => ({
  provider: (process.env.AUTH_PROVIDER === "dev" ? "dev" : "google") as "dev" | "google",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleIssuerUrl: process.env.GOOGLE_ISSUER_URL ?? "https://accounts.google.com",
  sessionSecret: process.env.SESSION_SECRET,
  reviewerEmails: parseEmailList(process.env.REVIEWER_EMAILS),
  adminEmails: parseEmailList(process.env.ADMIN_EMAILS),
}));

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
