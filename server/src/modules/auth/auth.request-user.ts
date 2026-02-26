import type { Request } from "express";
import type { UserClaims } from "./auth.types";

export function extractUserClaims(req: Request): UserClaims | undefined {
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
}

export function extractUserId(req: Request): string | undefined {
  return extractUserClaims(req)?.sub;
}
