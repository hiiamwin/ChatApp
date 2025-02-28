import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { RegisterRequestDto } from "./dto/register/register-request.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { ErrorResponse } from "src/common/error.response";
import { SuccessResponse } from "src/common/success.response";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { InjectQueue } from "@nestjs/bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Queue } from "bullmq";
import { ConfigService } from "@nestjs/config";
import { LoginResponseDto } from "./dto/login/login-response.dto";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue("send-mail") private readonly mailQueue: Queue,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User) {
    const userNoPassword = instanceToPlain(user);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...userNoPassword },
        {
          secret: this.configService.get("jwt.accessTokenSecret"),
          expiresIn: "3h",
        },
      ),
      this.jwtService.signAsync(
        { ...userNoPassword },
        {
          secret: this.configService.get("jwt.refreshTokenSecret"),
          expiresIn: "1d",
        },
      ),
    ]);

    await this.cacheManager.set(
      `${user.id}_refreshToken`,
      refreshToken,
      1 * 24 * 60 * 60 * 1000,
    );

    return new SuccessResponse<LoginResponseDto>(200, "Login successful", {
      accessToken,
      refreshToken,
      email: user.email,
      id: user.id,
      name: user.name,
    });
  }

  async validateUser(email: string, password: string) {
    const objectError = new ErrorResponse(400, "User error", {});
    const checkUser = await this.usersRepository.findOne({
      where: { email },
      select: ["password", "email", "status", "id", "name"],
    });
    if (!checkUser) {
      objectError.errors["email"] = "Invalid email";
      throw new BadRequestException(objectError);
    }

    const passwordMatch = await bcrypt.compare(password, checkUser.password);
    if (!passwordMatch) {
      objectError.errors["password"] = "Invalid password";
    }

    if (checkUser.status !== "verified") {
      objectError.errors["status"] = "User not verified";
    }

    if (Object.keys(objectError.errors).length > 0) {
      throw new BadRequestException(objectError);
    }

    return checkUser;
  }

  async regiter(registerRequestDto: RegisterRequestDto) {
    const objectError = new ErrorResponse(400, "Can not register", {});

    const checkUser = await this.usersRepository.findOne({
      where: { email: registerRequestDto.email },
    });
    if (checkUser) {
      objectError.errors["email"] = "Email already exists";
      throw new BadRequestException(objectError);
    }

    const saltOrRounds = 10;
    const hashedpassword = await bcrypt.hash(
      registerRequestDto.password,
      saltOrRounds,
    );
    const newuser = this.usersRepository.create({
      ...registerRequestDto,
      password: hashedpassword,
    });
    const savedUser = await this.usersRepository.save(newuser);

    const token = await this.jwtService.signAsync(
      { id: savedUser.id },
      { expiresIn: "10m" },
    );

    const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;
    await this.cacheManager.set(
      `${savedUser.id}_verify_token`,
      token,
      10 * 60 * 1000,
    );

    await this.mailQueue.add(
      "verify",
      {
        to: savedUser.email,
        link: verificationLink,
      },
      {
        removeOnComplete: true,
      },
    );

    return new SuccessResponse<User>(201, "Register successfully", savedUser);
  }

  async verify(token: string) {
    const errorObject = new ErrorResponse(400, "Can not verify", {});
    try {
      const payload = await this.jwtService.verifyAsync<{ id: string }>(token, {
        secret: this.configService.get<string>("jwt.accessTokenSecret"),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        errorObject.errors["user"] = "User not found";
      }

      if (user.status === "verified") {
        errorObject.errors["status"] = "User already verified";
      }

      const cachedToken = await this.cacheManager.get<string>(
        `${user.id}_verify_token`,
      );
      if (cachedToken !== token) {
        errorObject.errors["token"] = "Invalid token";
      }

      if (Object.keys(errorObject.errors).length > 0) {
        throw new BadRequestException(errorObject);
      }

      const verifedUser = await this.usersRepository.save({
        ...user,
        status: "verified",
      });

      await this.cacheManager.del(`${user.id}_verify_token`);

      return new SuccessResponse<string>(
        200,
        verifedUser.id,
        "User verified successfully",
      );
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        errorObject.errors["token"] = "Token expired";
        throw new BadRequestException(errorObject);
      }
      if (err instanceof JsonWebTokenError) {
        errorObject.errors["token"] = "Invalid token";
        throw new BadRequestException(errorObject);
      }
      throw new InternalServerErrorException("Internal server error");
    }
  }
}
