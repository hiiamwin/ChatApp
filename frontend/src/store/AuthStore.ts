import { LoginType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStoreType = {
  loginUser: LoginType | null;
  setLoginUser: (loginUser: LoginType) => void;
};
export const useAuthStore = create<AuthStoreType>()(
  persist(
    (set) => ({
      loginUser: null,
      setLoginUser: (loginUser) => set({ loginUser }),
    }),
    { name: "login-user" }
  )
);
