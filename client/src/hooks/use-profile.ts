import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { userService, type IProfileUpdateInput } from "@/services/userService";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function useProfile() {
  return useQuery({
    queryKey: [api.auth.profile.get.path],
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
      queryClient.invalidateQueries({ queryKey: [api.auth.profile.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      trackAnalyticsEvent("profile_updated", {
        route: "/profile",
        hasFirstName: Boolean(payload.firstName?.trim()),
        hasLastName: Boolean(payload.lastName?.trim()),
        hasAvatar: Boolean(payload.profileImageUrl?.trim()),
      });
    },
  });
}
