import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { api } from "@shared/routes";
import { UserTypeEnum } from "@shared/domain/enums";
import { resolveRoleFromEmail } from "./auth.roles";
import { AuthRepository } from "./auth.repository";
import { AppError } from "../../common/errors/app-error";

type UserClaims = {
  sub: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  profile_image_url?: string | null;
  picture?: string | null;
};

@Injectable()
export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async getAuthUser(claims: UserClaims) {
    try {
      const userId = claims.sub;
      let user = await this.repository.getUser(userId);
      const claimEmail = claims.email ?? null;
      const claimFirstName = claims.first_name ?? claims.given_name ?? null;
      const claimLastName = claims.last_name ?? claims.family_name ?? null;
      const claimProfileImageUrl = claims.profile_image_url ?? claims.picture ?? null;
      const resolvedRole = resolveRoleFromEmail(claims.email ?? user?.email ?? null);

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

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new AppError(500, "INTERNAL_ERROR", "Failed to fetch user");
    }
  }

  async getProfile(userId: string) {
    const user = await this.repository.getUser(userId);
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "Profile not found");
    }
    return {
      ...user,
      createdAt: user.createdAt?.toISOString() ?? null,
      updatedAt: user.updatedAt?.toISOString() ?? null,
    };
  }

  async updateProfile(userId: string, payload: unknown) {
    try {
      const parsed = api.profile.update.input.parse(payload);
      const updated = await this.repository.updateUserProfile(userId, {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        profileImageUrl: parsed.profileImageUrl === "" ? null : parsed.profileImageUrl,
      });

      if (!updated) {
        throw new AppError(404, "NOT_FOUND", "Profile not found");
      }

      return {
        ...updated,
        createdAt: updated.createdAt?.toISOString() ?? null,
        updatedAt: updated.updatedAt?.toISOString() ?? null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new AppError(400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      throw new AppError(500, "INTERNAL_ERROR", "Failed to update profile");
    }
  }
}
