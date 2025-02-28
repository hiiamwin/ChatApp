import React from "react";
import { Users } from "lucide-react";
import { Conversation, VideoCallButton } from "./_components";
import { cookies } from "next/headers";
import { decrypt } from "@/helper";
import { redirect } from "next/navigation";
import { getConversationById } from "@/apis";

type ChatRoomPageProps = {
  params: Promise<{ chatId: string }>;
};
async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) {
    redirect("/login");
  }
  const loginData = await decrypt(session.value);
  const { chatId } = await params;

  const response = await getConversationById(chatId);

  const otherMember = response.data.members.find(
    (member) => member.id !== loginData.id
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="font-semibold">{otherMember?.name}</h2>
        </div>
        <VideoCallButton
          conversationId={chatId}
          member={{
            email: otherMember?.email as string,
            id: otherMember?.id as string,
            name: otherMember?.name as string,
          }}
        />
      </div>
      <Conversation
        userId={loginData.id}
        email={loginData.email}
        name={loginData.name}
        conversationId={chatId}
      />
    </div>
  );
}

export default ChatRoomPage;
