import type { User } from "@shared/models/auth";
import { api } from "@shared/routes";
import { apiClient, buildApiUrl } from "./apiClient";
import { clearAuthToken, setAuthToken } from "./authTokenStorage";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<{
        success: true;
        error: false;
        data: User;
      }>(buildApiUrl(api.auth.me.path));
      return response.data.data;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        return null;
      }
      throw error;
    }
  },
  getLoginUrl(): string {
    return buildApiUrl(api.auth.googleLogin.path);
  },
  setToken(token: string): void {
    setAuthToken(token);
  },
  async logout(): Promise<void> {
    try {
      await apiClient.post(buildApiUrl(api.auth.logout.path));
    } finally {
      clearAuthToken();
    }
  },
};
