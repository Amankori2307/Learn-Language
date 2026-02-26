import { UserTypeEnum } from "@shared/domain/enums";
import { resolveRoleFromEmailFromConfig } from "../../config/auth.config";
import { runWithLifecycle } from "../../common/logger/logger";

export function resolveRoleFromEmail(
  email: string | null | undefined,
  input: {
    reviewerEmails: Set<string>;
    adminEmails: Set<string>;
  },
): UserTypeEnum {
  return runWithLifecycle("resolveRoleFromEmail", () =>
    resolveRoleFromEmailFromConfig(email, {
      reviewerEmails: input.reviewerEmails,
      adminEmails: input.adminEmails,
    }),
  );
}
