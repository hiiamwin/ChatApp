import { UserType } from "./user.type";

export type ConversationType = {
  id: string;
  name: string | null;
  isGroup: boolean;
  members: UserType[];
};
