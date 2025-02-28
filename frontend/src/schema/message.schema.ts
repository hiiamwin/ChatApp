import { z } from "zod";

export const getAllMessageSchema = z.object({
  conversationId: z.string(),
  page: z.number(),
  limit: z.number(),
});
