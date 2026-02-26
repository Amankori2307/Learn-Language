import type { Request, RequestHandler } from "express";
import { authStorage } from "./auth.storage";
import { sendError } from "../../common/http";
import { UserTypeEnum } from "@shared/domain/enums";
import { runWithLifecycle } from "../../common/logger/logger";

function getUserId(req: Request): string | undefined {
  return runWithLifecycle("getUserId", () => (req.user as any)?.claims?.sub);
}

export async function getCurrentUserRole(req: Request): Promise<UserTypeEnum | undefined> {
  return runWithLifecycle("getCurrentUserRole", async () => {
    const userId = getUserId(req);
    if (!userId) return undefined;

    // Dev mode bootstrap: local dev user is treated as reviewer/admin.
    if (userId === "dev-user") {
      return UserTypeEnum.ADMIN;
    }

    const user = await authStorage.getUser(userId);
    return user?.role ?? UserTypeEnum.LEARNER;
  });
}

export const requireReviewer: RequestHandler = async (req, res, next) => {
  return runWithLifecycle("requireReviewer", async () => {
    const role = await getCurrentUserRole(req);
    if (!role || (role !== UserTypeEnum.REVIEWER && role !== UserTypeEnum.ADMIN)) {
      return sendError(req, res, 403, "UNAUTHORIZED", "Reviewer access required");
    }
    return next();
  });
};
