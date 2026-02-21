import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";

export function useClusters() {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.clusters.list.path, language],
    queryFn: async () => {
      const params = new URLSearchParams({ language });
      const res = await fetch(`${api.clusters.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return api.clusters.list.responses[200].parse(await res.json());
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
      const res = await fetch(`${url}?${params.toString()}`, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cluster details");
      return api.clusters.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
