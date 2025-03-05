"use client";
import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useSocket } from "@/providers/socket-provider";
import { getAllMessageResponseType, MessageType } from "@/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getAllMessageAction } from "@/actions";
import { SubmitHandler, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";

type ConversationProps = {
  userId: string;
  email: string;
  name: string;
  conversationId: string;
};
function Conversation({
  userId,
  email,
  name,
  conversationId,
}: ConversationProps) {
  const { ref: loadMoreRef, inView } = useInView({ threshold: 1 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    socket?.on("receiveMessage", (newMessage: MessageType) => {
      if (newMessage.conversationId !== conversationId) return;
      queryClient.setQueryData<
        InfiniteData<{ data: getAllMessageResponseType }>
      >(["messages", conversationId], (oldData) => {
        if (!oldData) return oldData;
        const firstpage = oldData.pages[0];

        const updatedLastPage = {
          data: {
            ...firstpage.data,
            messages: [newMessage, ...firstpage.data.messages],
            total: firstpage.data.total || 0,
          },
        };
        const newPages = [...oldData.pages];
        newPages[0] = updatedLastPage;
        return {
          ...oldData,
          pages: newPages,
        };
      });
    });

    return () => {
      socket?.off("receiveMessage");
    };
  }, [socket, userId, conversationId, queryClient]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["messages", conversationId],
      queryFn: ({ pageParam }) => {
        return getAllMessageAction({
          conversationId,
          // page: pageParam.page as number,
          limit: 10,
          nextCursor: pageParam as string,
        });
      },
      getNextPageParam: (lastPage) => {
        const nextCursor = lastPage?.data?.nextCursor;
        return nextCursor ? nextCursor : undefined;
      },
      initialPageParam: "",

      refetchOnWindowFocus: false,
    });

  useEffect(() => {
    if (!isPending && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isPending]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMessages = data?.pages.flatMap((page) => page?.data?.messages) ?? [];

  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const onSubmit: SubmitHandler<{ message: string }> = (data) => {
    const newMessage: MessageType = {
      id: Date.now().toString(), // Temporary ID
      messageContent: data.message,
      conversationId,
      senderId: userId,
      sentAt: new Date().toISOString(),
      user: {
        id: userId,
        email,
        name,
      },
      status: "sending",
    };

    queryClient.setQueryData<InfiniteData<{ data: getAllMessageResponseType }>>(
      ["messages", conversationId],
      (oldData) => {
        if (!oldData) return oldData;

        const firstpage = oldData.pages[0];

        const updatedFirstPage = {
          data: {
            messages: [newMessage, ...firstpage.data.messages],
            total: firstpage.data.total || 0,
            nextCursor: firstpage.data.nextCursor,
          },
        };
        const newPages = [...oldData.pages];
        newPages[0] = updatedFirstPage;
        return {
          ...oldData,
          pages: newPages,
        };
      }
    );
    socket?.emit(
      "sendMessage",
      {
        conversationId,
        messageContent: data.message,
        senderId: userId,
      },
      (message: MessageType) => {
        console.log("Message sent", message);

        queryClient.setQueryData<
          InfiniteData<{ data: getAllMessageResponseType }>
        >(["messages", conversationId], (oldData) => {
          if (!oldData) return oldData;

          const firstpage = oldData.pages[0];

          const newMessages: MessageType[] = firstpage.data.messages.map(
            (msg) => {
              if (msg.id === newMessage.id) {
                return { ...msg, status: "sent" };
              }
              return msg;
            }
          );

          const updatedFirstPage = {
            data: {
              messages: newMessages,
              total: firstpage.data.total || 0,
              nextCursor: firstpage.data.nextCursor,
            },
          };
          const newPages = [...oldData.pages];
          newPages[0] = updatedFirstPage;
          return {
            ...oldData,
            pages: newPages,
          };
        });
      }
    );
    reset({ message: "" });
  };

  if (isPending) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
        {!isFetchingNextPage && <div ref={loadMoreRef}></div>}
        {isFetchingNextPage && (
          <div className="text-center py-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        )}

        <div className="space-y-4">
          {[...allMessages].reverse().map((message) => (
            <div
              className={`flex items-start gap-3 ${
                message?.senderId === userId ? "flex-row-reverse" : "flex-row"
              }`}
              key={message?.id}
            >
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 max-w-[100%]  ${
                  message?.senderId === userId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <p className="text-xs">{message?.user.name}</p>
                <p>{message?.messageContent}</p>
                <p>
                  {message?.status === "sending"
                    ? "Sending"
                    : message?.status === "error"
                    ? "error"
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t p-4">
        <form className="flex gap-2" onSubmit={handleSubmit(onSubmit)}>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            {...register("message")}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </>
  );
}

export default Conversation;
