import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  isGroup: boolean;

  @IsArray()
  @ArrayMinSize(2)
  @Type(() => Array)
  userIds: [string];
}
