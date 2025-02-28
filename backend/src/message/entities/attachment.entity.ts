import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn("uuid", { name: "message_id" })
  messageId: string;

  @Column()
  url: string;

  @Column()
  type: string;

  @OneToOne(() => Message, (message) => message.attachment)
  @JoinColumn({ name: "message_id" })
  message: Message;
}
