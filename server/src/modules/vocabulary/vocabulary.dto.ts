import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { LanguageEnum } from "@shared/domain/enums";
import { API_PAGINATION_DEFAULTS, API_PAGINATION_LIMITS } from "@shared/domain/api-limits";

export class ListWordsQueryDto {
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clusterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}

export class ListClustersQueryDto {
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsIn(["name_asc", "name_desc", "type_asc", "words_desc", "words_asc"])
  sort?: "name_asc" | "name_desc" | "type_asc" | "words_desc" | "words_asc";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(API_PAGINATION_DEFAULTS.PAGE)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(API_PAGINATION_LIMITS.GENERIC_MAX)
  limit?: number;
}
