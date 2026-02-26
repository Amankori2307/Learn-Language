import { api } from "@shared/routes";
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
    const response = await apiClient.get(buildApiUrl(api.profile.get.path));
    return api.profile.get.responses[200].parse(response.data) as IUserProfile;
  },
  async updateProfile(payload: IProfileUpdateInput): Promise<IUserProfile> {
    const response = await apiClient({
      url: buildApiUrl(api.profile.update.path),
      method: api.profile.update.method,
      data: payload,
    });
    return api.profile.update.responses[200].parse(response.data) as IUserProfile;
  },
};

