import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { userService, type IProfileUpdateInput } from "@/services/userService";

export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: userService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IProfileUpdateInput) => {
      return userService.updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });
}
