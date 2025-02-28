import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Controller("conversation")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.create(createConversationDto);
  }

  @Get("user/:userId")
  findUserConversations(@Param("userId") userId: string) {
    return this.conversationService.findUserConversations(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.conversationService.findOne(id);
  }
}
