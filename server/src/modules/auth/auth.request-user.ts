import type { Request } from "express";
import type { UserClaims } from "./auth.types";
import { runWithLifecycle } from "../../common/logger/logger";

export function extractUserClaims(req: Request): UserClaims | undefined {
  return runWithLifecycle("extractUserClaims", () => {
    const candidate = req.user as { claims?: UserClaims } | UserClaims | undefined;
    if (!candidate) {
      return undefined;
    }

    if ("claims" in candidate && candidate.claims) {
      return candidate.claims;
    }

    if ("sub" in candidate) {
      return candidate;
    }

    return undefined;
  });
}

export function extractUserId(req: Request): string | undefined {
  return runWithLifecycle("extractUserId", () => extractUserClaims(req)?.sub);
}
