import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./entities/message.entity";
import { Repository, LessThan } from "typeorm";
import { GetAllMessageRequestDto } from "./dto/get-all-message-request.dto";
import { SuccessResponse } from "src/common/success.response";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}
  async create(createMessageDto: CreateMessageDto) {
    const newMessage = await this.messageRepository.save(createMessageDto);
    return await this.messageRepository.findOne({
      where: { id: newMessage.id },
      relations: ["user"],
    });
  }

  async getAllMessage(
    conversationId: string,
    getAllMessageRequestDto: GetAllMessageRequestDto,
  ) {
    const where = {
      conversationId,
      sentAt: getAllMessageRequestDto.nextCursor
        ? LessThan(new Date(getAllMessageRequestDto.nextCursor))
        : undefined,
    };

    const [messages, total] = await this.messageRepository.findAndCount({
      where,
      relations: ["user"],
      order: { sentAt: "DESC" },
      take: getAllMessageRequestDto.limit + 1,
    });

    const isLastPage = messages.length <= getAllMessageRequestDto.limit;

    const nextCursor = isLastPage
      ? null
      : messages[getAllMessageRequestDto.limit - 1].sentAt;
    return new SuccessResponse(200, "Success", {
      messages: messages.slice(0, getAllMessageRequestDto.limit),
      total,
      nextCursor,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
