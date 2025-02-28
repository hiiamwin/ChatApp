"use client";
import React, { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket;
};
export const SocketContext = createContext<SocketContextType | null>(null);
function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = io("http://localhost:8080", {
    autoConnect: false,
  });

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
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export default SocketProvider;
