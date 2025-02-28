import { CallType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CallStoreType = {
  call: CallType;
  setCall: (call: CallType) => void;
  changeRingingStatus: (isRinging: boolean) => void;
  changeStatus: (status: CallType["status"]) => void;
};
export const useCallStore = create<CallStoreType>()(
  persist(
    (set) => ({
      call: {
        isRinging: false,
        otherMember: { id: "", name: "", email: "" },
        status: "free",
        signalData: null,
        conversationId: null,
      },
      setCall: (call) => set({ call }),
      changeRingingStatus: (isRinging) =>
        set((state) => ({ call: { ...state.call, isRinging } })),
      changeStatus: (status) =>
        set((state) => ({ call: { ...state.call, status } })),
    }),
    { name: "call-store" }
  )
);
