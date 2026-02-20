import { config } from "../config";

function parseEmailList(value?: string): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveRoleFromEmail(email?: string | null): "learner" | "reviewer" | "admin" {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return "learner";
  }

  const adminEmails = parseEmailList(config.ADMIN_EMAILS);
  if (adminEmails.has(normalized)) {
    return "admin";
  }

  const reviewerEmails = parseEmailList(config.REVIEWER_EMAILS);
  if (reviewerEmails.has(normalized)) {
    return "reviewer";
  }

  return "learner";
}
