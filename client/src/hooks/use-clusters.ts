import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, parseSuccessResponse } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";
import { AxiosError } from "axios";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export function useClusters() {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.clusters.list.path, language],
    queryFn: async () => {
      const params = new URLSearchParams({ language });
      const res = await apiClient.get(
        buildApiUrl(`${api.clusters.list.path}?${params.toString()}`),
      );
      return parseSuccessResponse(api.clusters.list.responses[200], res.data);
    },
  });
}

export function useCluster(id: number) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.clusters.get.path, id, language],
    queryFn: async () => {
      const url = buildUrl(api.clusters.get.path, { id });
      const params = new URLSearchParams({ language });
      try {
        const res = await apiClient.get(buildApiUrl(`${url}?${params.toString()}`));
        return parseSuccessResponse(api.clusters.get.responses[200], res.data);
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch cluster details", { cause: error });
      }
    },
    enabled: !!id,
  });
}
