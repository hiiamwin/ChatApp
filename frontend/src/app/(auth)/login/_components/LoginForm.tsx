"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import React from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schema";
import { loginAction } from "@/actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useAuthStore } from "@/store/AuthStore";
// import { useSocket } from "@/providers/socket-provider";

function LoginForm() {
  // const { socket } = useSocket();
  const setLoginUser = useAuthStore((state) => state.setLoginUser);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const { execute, isPending } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      toast.success("Login success");
      setLoginUser({
        accessToken: data?.data.accessToken as string,
        id: data?.data.id as string,
        email: data?.data.email as string,
        name: data?.data.name as string,
        refreshToken: data?.data.refreshToken as string,
      });
      // console.log(data?.data.id);
      // if (socket) {
      //   socket.auth = { userId: data?.data.id };
      //   socket?.connect();
      // }

      router.replace("/chat");
    },
    onError: ({ error }) => {
      const errors = JSON.parse(error.serverError as string);
      for (const key in errors) {
        setError(key as "email" | "password" | "root", {
          type: "manual",
          message: errors[key],
        });
      }
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof loginSchema>> = async (data) => {
    execute(data);
  };
  return (
    <form
      className="w-full max-w-sm flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Input your email"
          required
          disabled={isPending}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Input your password"
          required
          disabled={isPending}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        Login
      </Button>
    </form>
  );
}

export default LoginForm;
