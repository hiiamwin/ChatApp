// import { refreshToken } from "@/apis";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { decrypt, encrypt, isTokenExpired, MyError } from "@/helper";
// import { LoginType } from "@/types";
import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof MyError) {
      if (e.statusCode === 400) return e.message;
      else throw Error(e.message);
    }
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/login");
  const loginData = await decrypt(session);
  // const isExpired = await isTokenExpired(loginData.accessToken);
  // if (isExpired) {
  //   const response = await refreshToken(
  //     loginData.accessToken,
  //     loginData.refreshToken
  //   );

  //   const newLoginData: LoginType = {
  //     accessToken: response.data.accessToken,
  //     refreshToken: response.data.refreshToken,
  //     email: loginData.email,
  //     role: loginData.role,
  //     userId: loginData.userId,
  //   };

  //   const newSession = await encrypt(newLoginData);
  //   cookieStore.set("session", newSession, { httpOnly: true, secure: false });
  //   return next({ ctx: { accesstoken: newLoginData.accessToken } });
  // }
  return next({ ctx: { accesstoken: loginData.accessToken } });
});
