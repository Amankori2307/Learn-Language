import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { AxiosError } from "axios";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export function useWords(clusterId?: number) {
  return useQuery({
    queryKey: [api.words.list.path, { clusterId }],
    queryFn: async () => {
      const url = buildUrl(api.words.list.path);
      // Append query params manually since buildUrl only handles path params
      const queryParams = new URLSearchParams();
      if (clusterId) queryParams.append('clusterId', clusterId.toString());
      
      const res = await apiClient.get(buildApiUrl(`${url}?${queryParams.toString()}`));
      return api.words.list.responses[200].parse(res.data);
    },
  });
}

export function useWord(id: number) {
  return useQuery({
    queryKey: [api.words.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.words.get.path, { id });
      try {
        const res = await apiClient.get(buildApiUrl(url));
        return api.words.get.responses[200].parse(res.data);
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
