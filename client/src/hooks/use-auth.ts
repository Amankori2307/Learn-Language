import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { User } from "@shared/models/auth";
import { AUTH_QUERY_RULES } from "./auth.constants";
import { authService } from "@/services/authService";

export function authMeQueryKey() {
  return [api.auth.me.path] as const;
}

async function fetchUser(): Promise<User | null> {
  return authService.getCurrentUser();
}

async function logout(): Promise<void> {
  await authService.logout();
  window.location.href = "/auth";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: authMeQueryKey(),
    queryFn: fetchUser,
    retry: false,
    staleTime: AUTH_QUERY_RULES.USER_STALE_TIME_MS,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authMeQueryKey(), null);
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
