import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { LanguageEnum } from "@shared/domain/enums";

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
  @Max(200)
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
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}

