import type { User } from "@shared/models/auth";
import { apiClient, buildApiUrl } from "./apiClient";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(buildApiUrl("/auth/me"));
      return response.data;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        return null;
      }
      throw error;
    }
  },
  getLoginUrl(): string {
    return buildApiUrl("/auth/google");
  },
  async logout(): Promise<void> {
    await apiClient.post(buildApiUrl("/auth/logout"));
  },
};
