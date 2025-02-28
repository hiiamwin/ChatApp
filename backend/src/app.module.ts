import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import configuration from "config/configuration";
import { User } from "./user/entities/user.entity";
import { MailModule } from "./mail/mail.module";
import KeyvRedis from "@keyv/redis";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { ChatModule } from "./chat/chat.module";
import { ConversationModule } from "./conversation/conversation.module";
import { MessageModule } from "./message/message.module";
import { Attachment } from "./message/entities/attachment.entity";
import { Conversation } from "./conversation/entities/conversation.entity";
import { Message } from "./message/entities/message.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: +configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.name"),
        schema: configService.get("database.schema"),
        entities: [User, Attachment, Conversation, Message],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          stores: [new KeyvRedis(configService.get("redis.url"))],
        };
      },
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: { url: configService.get<string>("redis.url") },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    MailModule,
    ChatModule,
    ConversationModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
