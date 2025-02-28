import { UserType } from "./user.type";

export type LoginType = UserType & {
  accessToken: string;
  refreshToken: string;
};
