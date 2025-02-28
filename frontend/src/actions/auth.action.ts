"use server";
import { loginSchema } from "@/schema";
import { actionClient } from "./safe-action";
import { login } from "@/apis";
import { cookies } from "next/headers";
import { encrypt } from "@/helper";

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    const response = await login(parsedInput.email, parsedInput.password);

    const cookieStore = await cookies();
    const session = await encrypt(response.data);
    cookieStore.set("session", session, { httpOnly: true, secure: false });
    return response;
  });
