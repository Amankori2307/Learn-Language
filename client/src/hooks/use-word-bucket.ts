import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export type WordBucketType = "mastered" | "learning" | "needs_review";

export function useWordBucket(bucket: WordBucketType, page: number, limit: number = 20) {
  const { language } = useLearningLanguage();

  return useQuery({
    queryKey: [api.analytics.wordBuckets.path, bucket, page, limit, language],
    queryFn: async () => {
      const params = new URLSearchParams({
        bucket,
        page: String(page),
        limit: String(limit),
        language,
      });
      const res = await apiClient.get(buildApiUrl(`${api.analytics.wordBuckets.path}?${params.toString()}`));
      return api.analytics.wordBuckets.responses[200].parse(res.data);
    },
  });
}
