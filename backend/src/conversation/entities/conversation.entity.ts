import { Message } from "src/message/entities/message.entity";
import { User } from "src/user/entities/user.entity";
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false, name: "is_group" })
  isGroup: boolean;

  @OneToMany(() => Message, (message) => message.conversation)
  message: Message[];

  @ManyToMany(() => User, (user) => user.conversations)
  members: User[];
}
