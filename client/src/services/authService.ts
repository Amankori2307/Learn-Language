import type { User } from "@shared/models/auth";
import { apiClient, buildApiUrl } from "./apiClient";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(buildApiUrl("/api/auth/user"));
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
    return buildApiUrl("/api/login");
  },
  getLogoutUrl(): string {
    return buildApiUrl("/api/logout");
  },
};

