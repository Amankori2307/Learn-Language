import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useWords(clusterId?: number) {
  return useQuery({
    queryKey: [api.words.list.path, { clusterId }],
    queryFn: async () => {
      const url = buildUrl(api.words.list.path);
      // Append query params manually since buildUrl only handles path params
      const queryParams = new URLSearchParams();
      if (clusterId) queryParams.append('clusterId', clusterId.toString());
      
      const res = await fetch(`${url}?${queryParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch words");
      return api.words.list.responses[200].parse(await res.json());
    },
  });
}

export function useWord(id: number) {
  return useQuery({
    queryKey: [api.words.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.words.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch word");
      return api.words.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
