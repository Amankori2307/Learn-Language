import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, parseSuccessResponse } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";
import { AxiosError } from "axios";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export type ClustersListInput = {
  q: string;
  type: string;
  sort: "name_asc" | "name_desc" | "type_asc" | "words_desc" | "words_asc";
  page: number;
  limit: number;
};

export function clustersQueryKey(language: string) {
  return [api.clusters.list.path, language] as const;
}

export function clustersCatalogQueryKey(input: ClustersListInput, language: string) {
  return [api.clusters.list.path, input.q, input.type, input.sort, input.page, input.limit, language] as const;
}

export function clusterQueryKey(id: number, language: string) {
  return [api.clusters.get.path, id, language] as const;
}

export function useClustersForLanguage(language: string) {
  return useQuery({
    queryKey: clustersQueryKey(language),
    queryFn: async () => {
      const params = new URLSearchParams({ language });
      const res = await apiClient.get(
        buildApiUrl(`${api.clusters.list.path}?${params.toString()}`),
      );
      const payload = parseSuccessResponse(api.clusters.list.responses[200], res.data);
      return payload.items;
    },
  });
}

export function useClustersCatalog(input: ClustersListInput) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: clustersCatalogQueryKey(input, language),
    queryFn: async () => {
      const params = new URLSearchParams({
        q: input.q,
        type: input.type,
        sort: input.sort,
        page: String(input.page),
        limit: String(input.limit),
        language,
      });
      const res = await apiClient.get(
        buildApiUrl(`${api.clusters.list.path}?${params.toString()}`),
      );
      return parseSuccessResponse(api.clusters.list.responses[200], res.data);
    },
  });
}

export function useClusters() {
  const { language } = useLearningLanguage();
  return useClustersForLanguage(language);
}

export function useCluster(id: number) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: clusterQueryKey(id, language),
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
