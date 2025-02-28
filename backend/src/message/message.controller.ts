import { Controller, Get, Param, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { GetAllMessageRequestDto } from "./dto/get-all-message-request.dto";

@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(":conversationId")
  getAllMessage(
    @Param("conversationId") conversationId: string,
    @Query() getAllMessageRequestDto: GetAllMessageRequestDto,
  ) {
    return this.messageService.getAllMessage(
      conversationId,
      getAllMessageRequestDto,
    );
  }
}
