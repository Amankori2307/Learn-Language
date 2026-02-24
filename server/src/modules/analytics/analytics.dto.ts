import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { LanguageEnum } from "@shared/domain/enums";
import { API_PAGINATION_LIMITS } from "@shared/domain/api-limits";

export class LanguageQueryDto {
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}

export class AttemptHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(API_PAGINATION_LIMITS.GENERIC_MAX)
  limit?: number;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}

export class LeaderboardQueryDto {
  @IsOptional()
  @IsIn(["daily", "weekly", "all_time"])
  window?: "daily" | "weekly" | "all_time";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(API_PAGINATION_LIMITS.LEADERBOARD_MAX)
  limit?: number;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}

export class WordBucketQueryDto {
  @IsIn(["mastered", "learning", "needs_review"])
  bucket!: "mastered" | "learning" | "needs_review";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(API_PAGINATION_LIMITS.GENERIC_MAX)
  limit?: number;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}
