import { config } from "../config";
import { UserTypeEnum } from "@shared/domain/enums";

function parseEmailList(value?: string): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveRoleFromEmail(email?: string | null): UserTypeEnum {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return UserTypeEnum.LEARNER;
  }

  const adminEmails = parseEmailList(config.ADMIN_EMAILS);
  if (adminEmails.has(normalized)) {
    return UserTypeEnum.ADMIN;
  }

  const reviewerEmails = parseEmailList(config.REVIEWER_EMAILS);
  if (reviewerEmails.has(normalized)) {
    return UserTypeEnum.REVIEWER;
  }

  return UserTypeEnum.LEARNER;
}
