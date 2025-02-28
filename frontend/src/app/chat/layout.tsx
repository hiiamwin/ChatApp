import React from "react";
import { ChatSideBar, ComingCallDialog } from "./_components";

function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <ChatSideBar />
      {children}
      <ComingCallDialog />
    </div>
  );
}

export default ChatLayout;
