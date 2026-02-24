import { IsEnum, IsOptional } from "class-validator";
import { LanguageEnum } from "@shared/domain/enums";

export class SrsDriftQueryDto {
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}

