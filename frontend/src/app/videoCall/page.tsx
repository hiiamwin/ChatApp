import React from "react";
import { VideoScreen } from "./_components";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/helper";

async function VideoCallPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) {
    redirect("/login");
  }
  const loginData = await decrypt(session.value);
  const conversationId = (await searchParams).conversationId;
  return <VideoScreen conversationId={conversationId} userId={loginData.id} />;
}

export default VideoCallPage;
