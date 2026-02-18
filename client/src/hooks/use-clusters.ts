import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useClusters() {
  return useQuery({
    queryKey: [api.clusters.list.path],
    queryFn: async () => {
      const res = await fetch(api.clusters.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return api.clusters.list.responses[200].parse(await res.json());
    },
  });
}

export function useCluster(id: number) {
  return useQuery({
    queryKey: [api.clusters.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.clusters.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cluster details");
      return api.clusters.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
