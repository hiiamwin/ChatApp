import { Conversation } from "src/conversation/entities/conversation.entity";
import { User } from "src/user/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Attachment } from "./attachment.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "message_content" })
  messageContent: string;

  @Column({ name: "conversation_id" })
  conversationId: string;

  @Column({ name: "sender_id" })
  senderId: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    name: "sent_at",
  })
  sentAt: Date;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: "sender_id" })
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.message)
  @JoinColumn({ name: "conversation_id" })
  conversation: Conversation;

  @OneToOne(() => Attachment, (attachment) => attachment.message)
  attachment: Attachment;
}
