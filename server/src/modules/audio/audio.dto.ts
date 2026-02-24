import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";
import { LanguageEnum } from "@shared/domain/enums";
import { AUDIO_MODULE_CONSTANTS } from "./audio.constants";

export class ResolveAudioBodyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  wordId?: number;

  @IsEnum(LanguageEnum)
  language!: LanguageEnum;

  @IsOptional()
  @IsString()
  @MaxLength(AUDIO_MODULE_CONSTANTS.MAX_SYNTHESIS_CHARACTERS)
  text?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;
}
