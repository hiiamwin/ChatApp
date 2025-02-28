import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";
import { ConversationService } from "src/conversation/conversation.service";
import { MessageService } from "src/message/message.service";
import { CreateMessageDto } from "src/message/dto/create-message.dto";

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}
  @WebSocketServer() server: Server;
  async handleDisconnect(client: Socket) {}
  async handleConnection(client: Socket) {
    const { userId, conversationId } = client.handshake.auth;

    if (conversationId) {
      await client.join(`${conversationId}-call`);
      return;
    }

    const conversationResponse =
      await this.conversationService.findUserConversations(userId as string);
    const conversationIds = conversationResponse.data.map(
      (conversation) => conversation.id,
    );

    await client.join(conversationIds);
  }

  @SubscribeMessage("sendMessage")
  async receiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: CreateMessageDto,
  ) {
    const newMessage = await this.messageService.create(data);
    client.to(data.conversationId).emit("receiveMessage", newMessage);
  }

  @SubscribeMessage("makeCall")
  async signal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      signalData: any;
      conversationId: string;
      otherMember: { id: string; name: string; email: string };
    },
  ) {
    client
      .to(`${data.conversationId}`)
      .emit(
        "receiveCall",
        data.signalData,
        data.otherMember,
        data.conversationId,
      );
  }

  @SubscribeMessage("answerCall")
  async answerCall(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { signalData: any; conversationId: string },
  ) {
    client
      .to(`${data.conversationId}-call`)
      .emit("receiveAnswer", data.signalData);
  }

  @SubscribeMessage("rejectCall")
  async rejectCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.to(`${conversationId}-call`).emit("receiveRejectCall");
  }

  @SubscribeMessage("endCall")
  async endCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.to(`${conversationId}-call`).emit("receiveEndCall");
  }
}
