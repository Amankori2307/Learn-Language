import { LanguageEnum } from "@shared/domain/enums";

export type AttemptHistoryInput = {
  page?: number;
  limit?: number;
  language?: LanguageEnum;
  search?: string;
  result?: "all" | "correct" | "wrong";
  direction?: "all" | "source_to_target" | "target_to_source";
  sort?: "newest" | "oldest" | "confidence_desc" | "response_time_desc";
};

export type LeaderboardInput = {
  window?: "daily" | "weekly" | "all_time";
  page?: number;
  limit?: number;
  language?: LanguageEnum;
};

export type WordBucketInput = {
  bucket: "mastered" | "learning" | "needs_review";
  page?: number;
  limit?: number;
  language?: LanguageEnum;
};
