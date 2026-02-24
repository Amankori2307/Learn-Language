import { Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { UserTypeEnum } from "@shared/domain/enums";
import { resolveRoleFromEmail } from "./roles";
import { sendError } from "../http";
import { AuthRepository } from "./auth.repository";

interface IUserClaimsRequest extends Request {
  user: {
    claims: {
      sub: string;
      email?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      given_name?: string | null;
      family_name?: string | null;
      profile_image_url?: string | null;
      picture?: string | null;
    };
  };
}

export interface IAuthService {
  getAuthUser(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
  updateProfile(req: Request, res: Response): Promise<void>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(private readonly repository: AuthRepository) {}

  async getAuthUser(req: Request, res: Response): Promise<void> {
    try {
      const userRequest = req as IUserClaimsRequest;
      const userId = userRequest.user.claims.sub;
      let user = await this.repository.getUser(userId);
      const claimEmail = userRequest.user.claims.email ?? null;
      const claimFirstName = userRequest.user.claims.first_name ?? userRequest.user.claims.given_name ?? null;
      const claimLastName = userRequest.user.claims.last_name ?? userRequest.user.claims.family_name ?? null;
      const claimProfileImageUrl =
        userRequest.user.claims.profile_image_url ?? userRequest.user.claims.picture ?? null;
      const resolvedRole = resolveRoleFromEmail(userRequest.user.claims.email ?? user?.email ?? null);

      if (!user) {
        user = await this.repository.upsertUser({
          id: userId,
          email: claimEmail,
          firstName: claimFirstName,
          lastName: claimLastName,
          profileImageUrl: claimProfileImageUrl,
          role: userId === "dev-user" ? UserTypeEnum.ADMIN : resolvedRole,
        });
      } else {
        const shouldSyncRole = userId !== "dev-user" && user.role !== resolvedRole;
        const shouldBackfillProfile = Boolean(
          (!user.email && claimEmail) ||
            (!user.firstName && claimFirstName) ||
            (!user.lastName && claimLastName) ||
            (!user.profileImageUrl?.trim() && claimProfileImageUrl),
        );

        if (shouldSyncRole || shouldBackfillProfile) {
          user = await this.repository.upsertUser({
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
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as IUserClaimsRequest).user.claims.sub;
    const user = await this.repository.getUser(userId);
    if (!user) {
      sendError(req, res, 404, "NOT_FOUND", "Profile not found");
      return;
    }

    res.json({
      ...user,
      createdAt: user.createdAt?.toISOString() ?? null,
      updatedAt: user.updatedAt?.toISOString() ?? null,
    });
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as IUserClaimsRequest).user.claims.sub;
    try {
      const parsed = api.profile.update.input.parse(req.body);
      const updated = await this.repository.updateUserProfile(userId, {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        profileImageUrl: parsed.profileImageUrl === "" ? null : parsed.profileImageUrl,
      });

      if (!updated) {
        sendError(req, res, 404, "NOT_FOUND", "Profile not found");
        return;
      }

      res.json({
        ...updated,
        createdAt: updated.createdAt?.toISOString() ?? null,
        updatedAt: updated.updatedAt?.toISOString() ?? null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
        return;
      }
      sendError(req, res, 500, "INTERNAL_ERROR", "Failed to update profile");
    }
  }
}
