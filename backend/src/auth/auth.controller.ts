import {
  Controller,
  Post,
  Body,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterRequestDto } from "./dto/register/register-request.dto";
import { Request } from "express";
import { LocalGuard } from "./guards/local.guard";
import { User } from "src/user/entities/user.entity";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() registerRequestDto: RegisterRequestDto) {
    return this.authService.regiter(registerRequestDto);
  }

  @UseGuards(LocalGuard)
  @Post("login")
  async login(@Req() req: Request) {
    return await this.authService.login(req.user as User);
  }

  @Put("verify")
  async verify(@Query("token") token: string) {
    return await this.authService.verify(token);
  }

  // @Post("refreshToken")
  // async refreshToken(@Req() req: UserRequest) {
  //   return this.AuthService.refreshToken(
  //     req.user.user_id,
  //     req.user.email,
  //     req.user.role,
  //   );
  // }
}
