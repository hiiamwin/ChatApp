import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetAllMessageRequestDto {
  @IsNumber()
  @Type(() => Number)
  page: number;

  @IsNumber()
  @Type(() => Number)
  limit: number;
}
