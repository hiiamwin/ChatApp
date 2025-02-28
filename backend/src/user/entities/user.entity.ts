import { Exclude } from "class-transformer";
import { Conversation } from "src/conversation/entities/conversation.entity";
import { Message } from "src/message/entities/message.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({
    default: "not verify",
    enum: ["not verify", "verify"],
    select: false,
  })
  status: string;

  @ManyToMany(() => Conversation, (conversation) => conversation.members)
  @JoinTable({
    name: "conversation_member",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "conversation_id", referencedColumnName: "id" },
  })
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
