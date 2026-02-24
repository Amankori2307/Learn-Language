import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from "class-validator";

export class SubmitFeedbackBodyDto {
  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsUrl()
  pageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

