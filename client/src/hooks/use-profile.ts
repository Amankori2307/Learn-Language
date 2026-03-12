import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { userService, type IProfileUpdateInput } from "@/services/userService";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { authMeQueryKey } from "@/hooks/use-auth";

export function profileQueryKey() {
  return [api.auth.profile.get.path] as const;
}

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKey(),
    queryFn: userService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IProfileUpdateInput) => {
      return userService.updateProfile(payload);
    },
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey() });
      queryClient.invalidateQueries({ queryKey: authMeQueryKey() });
      trackAnalyticsEvent("profile_updated", {
        route: "/profile",
        hasFirstName: Boolean(payload.firstName?.trim()),
        hasLastName: Boolean(payload.lastName?.trim()),
        hasAvatar: Boolean(payload.profileImageUrl?.trim()),
      });
    },
  });
}
