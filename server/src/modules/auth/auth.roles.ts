import { UserTypeEnum } from "@shared/domain/enums";
import { resolveRoleFromEmailFromConfig } from "../../config/auth.config";

export function resolveRoleFromEmail(
  email: string | null | undefined,
  input: {
    reviewerEmails: Set<string>;
    adminEmails: Set<string>;
  },
): UserTypeEnum {
  return resolveRoleFromEmailFromConfig(email, {
    reviewerEmails: input.reviewerEmails,
    adminEmails: input.adminEmails,
  });
}
