import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { Conversation } from "./entities/conversation.entity";
import { In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorResponse } from "src/common/error.response";
import { User } from "src/user/entities/user.entity";
import { SuccessResponse } from "src/common/success.response";

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createConversationDto: CreateConversationDto) {
    const errorObject = new ErrorResponse(400, "Bad Request", {});
    if (createConversationDto.isGroup) {
      const checkConversation = await this.conversationRepository.findOne({
        where: {
          name: createConversationDto.name,
        },
      });
      if (checkConversation) {
        errorObject.errors["name"] = "Name already exists";
      }
    }

    const checkUsers = await this.userRepository.findBy({
      id: In(createConversationDto.userIds),
    });

    if (checkUsers.length !== createConversationDto.userIds.length) {
      errorObject.errors["userIds"] = "Invalid user ids";
    }

    if (Object.keys(errorObject.errors).length > 0) {
      throw new BadRequestException(errorObject);
    }
    await this.conversationRepository.save({
      isGroup: createConversationDto.isGroup,
      name: createConversationDto.name ? createConversationDto.name : null,
      members: createConversationDto.userIds.map((userId) => ({
        id: userId,
      })),
    });
    return new SuccessResponse(201, "Conversation created successfully", {});
  }

  findAll() {
    return `This action returns all conversation`;
  }

  async findOne(id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ["members"],
    });
    return new SuccessResponse(200, "", conversation);
  }

  async findUserConversations(userId: string) {
    const conversations = await this.conversationRepository
      .createQueryBuilder("conversation")
      .innerJoinAndSelect("conversation.members", "member")
      .innerJoin("conversation.members", "user")
      .where("user.id = :userId", { userId })

      .getMany();
    return new SuccessResponse(200, "", conversations);
  }
}
