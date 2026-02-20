import type { Request, RequestHandler } from "express";
import { authStorage } from "./storage";
import { sendError } from "../http";

function getUserId(req: Request): string | undefined {
  return (req.user as any)?.claims?.sub;
}

export async function getCurrentUserRole(req: Request): Promise<string | undefined> {
  const userId = getUserId(req);
  if (!userId) return undefined;

  // Dev mode bootstrap: local dev user is treated as reviewer/admin.
  if (userId === "dev-user") {
    return "admin";
  }

  const user = await authStorage.getUser(userId);
  return user?.role ?? "learner";
}

export const requireReviewer: RequestHandler = async (req, res, next) => {
  const role = await getCurrentUserRole(req);
  if (!role || (role !== "reviewer" && role !== "admin")) {
    return sendError(req, res, 403, "UNAUTHORIZED", "Reviewer access required");
  }
  return next();
};
