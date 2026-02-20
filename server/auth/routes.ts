import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./oidcAuth";
import { sendError } from "../http";

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
}
