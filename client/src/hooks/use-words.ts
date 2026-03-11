import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, parseSuccessResponse } from "@shared/routes";
import { AxiosError } from "axios";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export function wordsQueryKey(clusterId?: number) {
  return [api.words.list.path, clusterId ?? null] as const;
}

export function wordQueryKey(id: number) {
  return [api.words.get.path, id] as const;
}

export function useWords(clusterId?: number) {
  return useQuery({
    queryKey: wordsQueryKey(clusterId),
    queryFn: async () => {
      const url = buildUrl(api.words.list.path);
      // Append query params manually since buildUrl only handles path params
      const queryParams = new URLSearchParams();
      if (clusterId) queryParams.append("clusterId", clusterId.toString());

      const res = await apiClient.get(buildApiUrl(`${url}?${queryParams.toString()}`));
      return parseSuccessResponse(api.words.list.responses[200], res.data);
    },
  });
}

export function useWord(id: number) {
  return useQuery({
    queryKey: wordQueryKey(id),
    queryFn: async () => {
      const url = buildUrl(api.words.get.path, { id });
      try {
        const res = await apiClient.get(buildApiUrl(url));
        return parseSuccessResponse(api.words.get.responses[200], res.data);
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch word", { cause: error });
      }
    },
    enabled: !!id,
  });
}
