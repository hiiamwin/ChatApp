import { MyError } from "@/helper";
import { LoginType, ResponseType } from "@/types";

export async function login(
  email: string,
  password: string
): Promise<ResponseType<LoginType>> {
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  if (data.status === 400) {
    throw new MyError(400, JSON.stringify(data.errors));
  }

  return data;
}
