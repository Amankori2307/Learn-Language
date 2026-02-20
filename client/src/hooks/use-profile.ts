import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

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

export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load profile");
      return api.profile.get.responses[200].parse(await res.json()) as IUserProfile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IProfileUpdateInput) => {
      const res = await fetch(api.profile.update.path, {
        method: api.profile.update.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profile.update.responses[200].parse(await res.json()) as IUserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}
