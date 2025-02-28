import { UserType } from "./user.type";

export type MessageType = {
  id: string;
  messageContent: string;
  conversationId: string;
  senderId: string;
  sentAt: string;
  user: UserType;
};

export type getAllMessageResponseType = {
  messages: MessageType[];
  total: number;
};
