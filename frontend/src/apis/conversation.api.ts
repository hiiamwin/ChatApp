import {
  ConversationType,
  getAllMessageResponseType,
  ResponseType,
} from "@/types";

export async function getAllConverSationByUserId(
  userId: string
): Promise<ResponseType<ConversationType[]>> {
  const response = await fetch(
    `${process.env.API_URL}/conversation/user/${userId}`
  );
  const data = await response.json();
  return data;
}

export async function getMessage(
  conversationId: string,
  // page: number,

  limit: number,
  nextCursor: string | null
): Promise<ResponseType<getAllMessageResponseType>> {
  const response = await fetch(
    `${process.env.API_URL}/message/${conversationId}?nextCursor=${nextCursor}&limit=${limit}`
  );
  const data = await response.json();
  return data;
}

export async function getConversationById(
  id: string
): Promise<ResponseType<ConversationType>> {
  const response = await fetch(`${process.env.API_URL}/conversation/${id}`);
  const data = await response.json();
  return data;
}
