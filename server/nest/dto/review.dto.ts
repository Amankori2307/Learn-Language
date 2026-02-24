import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { LanguageEnum, PartOfSpeechEnum, ReviewDisagreementStatusEnum, ReviewStatusEnum } from "@shared/domain/enums";

export class ReviewQueueQueryDto {
  @IsOptional()
  @IsEnum(ReviewStatusEnum)
  status?: ReviewStatusEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class ReviewConflictsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class ReviewTransitionBodyDto {
  @IsEnum(ReviewStatusEnum)
  toStatus!: ReviewStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  reviewerConfidenceScore?: number;

  @IsOptional()
  @IsBoolean()
  requiresSecondaryReview?: boolean;

  @IsOptional()
  @IsEnum(ReviewDisagreementStatusEnum)
  disagreementStatus?: ReviewDisagreementStatusEnum;
}

export class ReviewBulkTransitionBodyDto extends ReviewTransitionBodyDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids!: number[];
}

export class ReviewResolveConflictBodyDto {
  @IsEnum(ReviewStatusEnum)
  toStatus!: ReviewStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  reviewerConfidenceScore?: number;
}

export class ReviewDraftExampleDto {
  @IsString()
  originalScript!: string;

  @IsString()
  pronunciation!: string;

  @IsString()
  englishSentence!: string;
}

export class ReviewSubmitDraftBodyDto {
  @IsEnum(LanguageEnum)
  language!: LanguageEnum;

  @IsString()
  originalScript!: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  transliteration?: string;

  @IsString()
  english!: string;

  @IsEnum(PartOfSpeechEnum)
  partOfSpeech!: PartOfSpeechEnum;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  clusterIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewDraftExampleDto)
  examples?: ReviewDraftExampleDto[];
}

