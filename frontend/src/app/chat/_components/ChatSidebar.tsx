import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateConversationDialog from "./CreateConversationDialog";
import { getAllConverSationByUserId } from "@/apis/conversation.api";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/helper";
import Link from "next/link";

async function ChatSideBar() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) {
    redirect("/login");
  }
  const loginData = await decrypt(session.value);

  const conversations = await getAllConverSationByUserId(loginData.id);

  return (
    <div className="hidden md:flex flex-col w-80 border-r">
      <CreateConversationDialog />
      <ScrollArea className="flex-1">
        {conversations.data.map((conversation) => {
          if (conversation.isGroup) {
            return (
              <Link
                href={`/chat/${conversation.id}`}
                key={conversation.id}
                className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer"
              >
                <Avatar>
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold">{conversation.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    chat last message
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">chat time</div>
              </Link>
            );
          }
          return (
            <Link
              href={`/chat/${conversation.id}`}
              key={conversation.id}
              className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer"
            >
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold">
                  {
                    conversation.members.filter(
                      (member) => member.id !== loginData.id
                    )[0].name
                  }
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  chat last message
                </div>
              </div>
              <div className="text-xs text-muted-foreground">chat time</div>
            </Link>
          );
        })}
      </ScrollArea>
    </div>
  );
}

export default ChatSideBar;
