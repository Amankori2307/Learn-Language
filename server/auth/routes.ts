import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./oidcAuth";
import { sendError } from "../http";
import { api } from "@shared/routes";
import { z } from "zod";
import { resolveRoleFromEmail } from "./roles";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await authStorage.getUser(userId);
      const claimEmail = req.user.claims.email ?? null;
      const claimFirstName = req.user.claims.first_name ?? req.user.claims.given_name ?? null;
      const claimLastName = req.user.claims.last_name ?? req.user.claims.family_name ?? null;
      const claimProfileImageUrl = req.user.claims.profile_image_url ?? req.user.claims.picture ?? null;
      const resolvedRole = resolveRoleFromEmail(req.user.claims.email ?? user?.email ?? null);
      if (!user) {
        user = await authStorage.upsertUser({
          id: userId,
          email: claimEmail,
          firstName: claimFirstName,
          lastName: claimLastName,
          profileImageUrl: claimProfileImageUrl,
          role: userId === "dev-user" ? "admin" : resolvedRole,
        });
      } else {
        const shouldSyncRole = userId !== "dev-user" && user.role !== resolvedRole;
        const shouldBackfillProfile = Boolean(
          (!user.email && claimEmail) ||
          (!user.firstName && claimFirstName) ||
          (!user.lastName && claimLastName) ||
          (!user.profileImageUrl?.trim() && claimProfileImageUrl)
        );

        if (shouldSyncRole || shouldBackfillProfile) {
        user = await authStorage.upsertUser({
          id: user.id,
          email: user.email ?? claimEmail,
          firstName: user.firstName ?? claimFirstName,
          lastName: user.lastName ?? claimLastName,
          profileImageUrl: user.profileImageUrl ?? claimProfileImageUrl,
          role: resolvedRole,
        });
      }
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      sendError(req, res, 500, "INTERNAL_ERROR", "Failed to fetch user");
    }
  });

  // Profile details for current user
  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const user = await authStorage.getUser(userId);
    if (!user) {
      return sendError(req, res, 404, "NOT_FOUND", "Profile not found");
    }

    res.json({
      ...user,
      createdAt: user.createdAt?.toISOString() ?? null,
      updatedAt: user.updatedAt?.toISOString() ?? null,
    });
  });

  // Update profile fields and avatar URL
  app.patch(api.profile.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const parsed = api.profile.update.input.parse(req.body);
      const updated = await authStorage.updateUserProfile(userId, {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        profileImageUrl: parsed.profileImageUrl === "" ? null : parsed.profileImageUrl,
      });

      if (!updated) {
        return sendError(req, res, 404, "NOT_FOUND", "Profile not found");
      }

      res.json({
        ...updated,
        createdAt: updated.createdAt?.toISOString() ?? null,
        updatedAt: updated.updatedAt?.toISOString() ?? null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.errors[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to update profile");
    }
  });
}
