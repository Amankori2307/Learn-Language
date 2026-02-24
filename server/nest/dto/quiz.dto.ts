import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { LanguageEnum, QuizDirectionEnum, QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";

export class GenerateQuizQueryDto {
  @IsOptional()
  @IsEnum(QuizModeEnum)
  mode?: QuizModeEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clusterId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}

export class SubmitQuizBodyDto {
  @Type(() => Number)
  @IsInt()
  wordId!: number;

  @Type(() => Number)
  @IsInt()
  selectedOptionId!: number;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;

  @IsOptional()
  @IsEnum(QuizQuestionTypeEnum)
  questionType?: QuizQuestionTypeEnum;

  @IsOptional()
  @IsEnum(QuizDirectionEnum)
  direction?: QuizDirectionEnum;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  confidenceLevel!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  responseTimeMs?: number;
}

