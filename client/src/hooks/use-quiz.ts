import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { QuizModeEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";
import { AxiosError } from "axios";
import { apiClient, buildApiUrl } from "@/services/apiClient";

// Types derived from API definition
export type QuizMode = QuizModeEnum;
type QuizSubmitInput = z.infer<typeof api.quiz.submit.input>;

export function useGenerateQuiz(mode: QuizMode = QuizModeEnum.DAILY_REVIEW, clusterId?: number) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.quiz.generate.path, { mode, clusterId, language }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('mode', mode);
      params.append("language", language);
      if (clusterId) params.append('clusterId', clusterId.toString());
      
      const res = await apiClient.get(buildApiUrl(`${api.quiz.generate.path}?${params.toString()}`));
      return api.quiz.generate.responses[200].parse(res.data);
    },
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh quiz
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  const { language } = useLearningLanguage();
  return useMutation({
    mutationFn: async (data: QuizSubmitInput) => {
      const payload = {
        ...data,
        language,
      };
      const res = await apiClient({
        url: buildApiUrl(api.quiz.submit.path),
        method: api.quiz.submit.method,
        data: payload,
      });

      return api.quiz.submit.responses[200].parse(res.data);
    },
    onSuccess: () => {
      // Invalidate stats to refresh dashboard progress immediately
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path, language] });
    }
  });
}

export function useStats() {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.stats.get.path, language],
    queryFn: async () => {
      const params = new URLSearchParams({ language });
      try {
        const res = await apiClient.get(buildApiUrl(`${api.stats.get.path}?${params.toString()}`));
        return api.stats.get.responses[200].parse(res.data);
      } catch (error) {
        if ((error as AxiosError).response?.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch stats", { cause: error });
      }
    },
  });
}

export function useLearningInsights() {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.analytics.learning.path, language],
    queryFn: async () => {
      const params = new URLSearchParams({ language });
      try {
        const res = await apiClient.get(buildApiUrl(`${api.analytics.learning.path}?${params.toString()}`));
        return api.analytics.learning.responses[200].parse(res.data);
      } catch (error) {
        if ((error as AxiosError).response?.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch learning insights", { cause: error });
      }
    },
  });
}

export function useSeedData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(buildApiUrl(api.admin.seed.path));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });
}
