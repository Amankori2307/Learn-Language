import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { QuizModeEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";

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
      
      const res = await fetch(`${api.quiz.generate.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to generate quiz");
      return api.quiz.generate.responses[200].parse(await res.json());
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
      const res = await fetch(api.quiz.submit.path, {
        method: api.quiz.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to submit answer");
      return api.quiz.submit.responses[200].parse(await res.json());
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
      const res = await fetch(`${api.stats.get.path}?${params.toString()}`, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
  });
}

export function useLearningInsights() {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.analytics.learning.path, language],
    queryFn: async () => {
      const params = new URLSearchParams({ language });
      const res = await fetch(`${api.analytics.learning.path}?${params.toString()}`, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch learning insights");
      return api.analytics.learning.responses[200].parse(await res.json());
    },
  });
}

export function useSeedData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.admin.seed.path, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to seed data");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });
}
