import "server-only";
import { SignJWT, jwtVerify } from "jose";
import type { LoginType } from "@/types";
import { jwtDecode } from "jwt-decode";

const key = new TextEncoder().encode(process.env.SECRET_KEY);
export async function encrypt(payload: LoginType) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3day")
    .sign(key);
}

export async function decrypt(session: string): Promise<LoginType> {
  const { payload } = await jwtVerify(session, key, {
    algorithms: ["HS256"],
  });
  return payload as LoginType;
}

export async function isTokenExpired(accessToken: string) {
  const { exp } = await jwtDecode(accessToken);
  const currentTime = Math.floor(Date.now() / 1000);
  if (exp && exp - currentTime < 30 * 60) {
    return true;
  }
  return false;
}
