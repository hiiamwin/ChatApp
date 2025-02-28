import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
