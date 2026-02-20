import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Types derived from API definition
export type QuizMode = 'daily_review' | 'new_words' | 'cluster' | 'weak_words' | 'complex_workout';
type QuizSubmitInput = z.infer<typeof api.quiz.submit.input>;

export function useGenerateQuiz(mode: QuizMode = 'daily_review', clusterId?: number) {
  return useQuery({
    queryKey: [api.quiz.generate.path, { mode, clusterId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('mode', mode);
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
  return useMutation({
    mutationFn: async (data: QuizSubmitInput) => {
      const res = await fetch(api.quiz.submit.path, {
        method: api.quiz.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to submit answer");
      return api.quiz.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate stats to refresh dashboard progress immediately
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    }
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
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
