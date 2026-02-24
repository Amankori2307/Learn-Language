import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { LanguageEnum } from "@shared/domain/enums";

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
}

