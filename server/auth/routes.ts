import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./oidcAuth";
import { sendError } from "../http";
import { api } from "@shared/routes";
import { z } from "zod";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
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
