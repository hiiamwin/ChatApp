"use server";
import { getAllMessageSchema } from "@/schema";
import { actionClient } from "./safe-action";
import { getMessage } from "@/apis";

export const getAllMessageAction = actionClient
  .schema(getAllMessageSchema)
  .action(async ({ parsedInput }) => {
    const response = await getMessage(
      parsedInput.conversationId,
      parsedInput.page,
      parsedInput.limit
    );
    return response.data;
  });
