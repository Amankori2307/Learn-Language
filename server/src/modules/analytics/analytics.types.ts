import { LanguageEnum } from "@shared/domain/enums";

export type AttemptHistoryInput = {
  limit?: number;
  language?: LanguageEnum;
};

export type LeaderboardInput = {
  window?: "daily" | "weekly" | "all_time";
  limit?: number;
  language?: LanguageEnum;
};

export type WordBucketInput = {
  bucket: "mastered" | "learning" | "needs_review";
  page?: number;
  limit?: number;
  language?: LanguageEnum;
};
