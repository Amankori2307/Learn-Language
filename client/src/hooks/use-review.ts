import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { LanguageEnum, ReviewStatusEnum } from "@shared/domain/enums";

export type ReviewStatus = ReviewStatusEnum;

export function useReviewQueue(status: ReviewStatus, limit = 50) {
  return useQuery({
    queryKey: [api.review.queue.path, status, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        status,
        limit: String(limit),
      });
      const res = await fetch(`${api.review.queue.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load review queue");
      return api.review.queue.responses[200].parse(await res.json());
    },
  });
}

export function useReviewHistory(wordId?: number) {
  return useQuery({
    queryKey: [api.review.history.path, wordId],
    enabled: Boolean(wordId),
    queryFn: async () => {
      const res = await fetch(`/api/review/words/${wordId}/history`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load review history");
      return api.review.history.responses[200].parse(await res.json());
    },
  });
}

export function useTransitionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; toStatus: ReviewStatus; notes?: string }) => {
      const res = await fetch(`/api/review/words/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ toStatus: payload.toStatus, notes: payload.notes }),
      });
      if (!res.ok) throw new Error("Failed to update review status");
      return api.review.transition.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.review.queue.path] });
      queryClient.invalidateQueries({ queryKey: [api.review.history.path] });
    },
  });
}

export function useBulkTransitionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ids: number[]; toStatus: ReviewStatus; notes?: string }) => {
      const res = await fetch(api.review.bulkTransition.path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to bulk update review statuses");
      return api.review.bulkTransition.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.review.queue.path] });
      queryClient.invalidateQueries({ queryKey: [api.review.history.path] });
    },
  });
}

export function useCreateReviewDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      language: LanguageEnum;
      originalScript: string;
      pronunciation: string;
      english: string;
      partOfSpeech: string;
      audioUrl?: string;
      imageUrl?: string;
      sourceUrl?: string;
      tags?: string[];
      examples: Array<{
        originalScript: string;
        pronunciation: string;
        englishSentence: string;
        contextTag: string;
        difficulty: number;
      }>;
    }) => {
      const res = await fetch(api.review.submitDraft.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit draft");
      return api.review.submitDraft.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.review.queue.path] });
    },
  });
}
