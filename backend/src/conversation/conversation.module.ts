import { Module } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { ConversationController } from "./conversation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./entities/conversation.entity";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), UserModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
