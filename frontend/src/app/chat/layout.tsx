import React from "react";
import { ChatSideBar, ComingCallDialog } from "./_components";
import SocketProvider from "@/providers/socket-provider";

function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <SocketProvider socketUrl={process.env.SOCKET_URL as string}>
        <ChatSideBar />

        {children}
        <ComingCallDialog />
      </SocketProvider>
    </div>
  );
}

export default ChatLayout;
