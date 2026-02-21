import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";

export function useAttemptHistory(limit: number = 100) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.attempts.history.path, limit, language],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), language });
      const res = await fetch(`${api.attempts.history.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load attempt history");
      return api.attempts.history.responses[200].parse(await res.json());
    },
  });
}
