import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { AUTH_QUERY_RULES } from "./auth.constants";
import { authService } from "@/services/authService";

async function fetchUser(): Promise<User | null> {
  return authService.getCurrentUser();
}

async function logout(): Promise<void> {
  window.location.href = authService.getLogoutUrl();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: AUTH_QUERY_RULES.USER_STALE_TIME_MS,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
