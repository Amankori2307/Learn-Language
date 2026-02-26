import type { Request, RequestHandler } from "express";
import { authStorage } from "./auth.storage";
import { sendError } from "../../common/http";
import { UserTypeEnum } from "@shared/domain/enums";
import { extractUserId } from "./auth.request-user";
import { appLogger } from "../../common/logger/logger";

function getUserId(req: Request): string | undefined {
  appLogger.debug("auth.permissions.getUserId.start", {
    requestId: req.requestId ?? "unknown",
  });
  const userId = extractUserId(req);
  appLogger.debug("auth.permissions.getUserId.end", {
    requestId: req.requestId ?? "unknown",
    hasUserId: Boolean(userId),
  });
  return userId;
}

export async function getCurrentUserRole(req: Request): Promise<UserTypeEnum | undefined> {
  appLogger.debug("auth.permissions.getCurrentUserRole.start", {
    requestId: req.requestId ?? "unknown",
  });
  const userId = getUserId(req);
  if (!userId) return undefined;

  // Dev mode bootstrap: local dev user is treated as reviewer/admin.
  if (userId === "dev-user") {
    return UserTypeEnum.ADMIN;
  }

  const user = await authStorage.getUser(userId);
  const resolvedRole = user?.role ?? UserTypeEnum.LEARNER;
  appLogger.debug("auth.permissions.getCurrentUserRole.end", {
    requestId: req.requestId ?? "unknown",
    userId,
    role: resolvedRole,
  });
  return resolvedRole;
}

export const requireReviewer: RequestHandler = async (req, res, next) => {
  appLogger.debug("auth.permissions.requireReviewer.start", {
    requestId: req.requestId ?? "unknown",
  });
  const role = await getCurrentUserRole(req);
  if (!role || (role !== UserTypeEnum.REVIEWER && role !== UserTypeEnum.ADMIN)) {
    appLogger.warn("auth.permissions.requireReviewer.reject", {
      requestId: req.requestId ?? "unknown",
      role: role ?? null,
    });
    return sendError(req, res, 403, "UNAUTHORIZED", "Reviewer access required");
  }
  appLogger.debug("auth.permissions.requireReviewer.end", {
    requestId: req.requestId ?? "unknown",
    role,
  });
  return next();
};
