import { api, parseSuccessResponse } from "@shared/routes";
import { apiClient, buildApiUrl } from "./apiClient";

export interface IUserProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export const userService = {
  async getProfile(): Promise<IUserProfile> {
    const response = await apiClient.get(buildApiUrl(api.auth.profile.get.path));
    return parseSuccessResponse(api.auth.profile.get.responses[200], response.data) as IUserProfile;
  },
  async updateProfile(payload: IProfileUpdateInput): Promise<IUserProfile> {
    const response = await apiClient({
      url: buildApiUrl(api.auth.profile.update.path),
      method: api.auth.profile.update.method,
      data: payload,
    });
    return parseSuccessResponse(api.auth.profile.update.responses[200], response.data) as IUserProfile;
  },
};
