import { UserType } from "./user.type";
import Peer from "simple-peer";

export type CallType = {
  isRinging: boolean;
  otherMember: UserType;
  status: "free" | "busy";
  signalData: Peer.SignalData | null;
  conversationId: string | null;
};
