import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./entities/message.entity";
import { Repository } from "typeorm";
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
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ["user"],
      order: { sentAt: "DESC" },
      skip: (getAllMessageRequestDto.page - 1) * getAllMessageRequestDto.limit,
      take: getAllMessageRequestDto.limit,
    });
    return new SuccessResponse(200, "Success", {
      messages,
      total,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
