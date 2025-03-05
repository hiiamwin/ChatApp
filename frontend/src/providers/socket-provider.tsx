"use client";
import { useAuthStore } from "@/store/AuthStore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
};
export const SocketContext = createContext<SocketContextType>({ socket: null });
function SocketProvider({
  children,
  socketUrl,
}: {
  children: React.ReactNode;
  socketUrl: string;
}) {
  const loginUser = useAuthStore((state) => state.loginUser);

  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socket = io(socketUrl, {
      // autoConnect: false,
      reconnection: true,
    });
    socket.auth = { userId: loginUser?.id };
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, [loginUser?.id, socketUrl]);

  if (!loginUser) {
    return null;
  }
  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  return context;
}

export default SocketProvider;
