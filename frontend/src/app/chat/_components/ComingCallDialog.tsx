"use client";
import { useSocket } from "@/providers/socket-provider";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useCallStore } from "@/store/CallStore";

function ComingCallDialog() {
  const { socket } = useSocket();
  const call = useCallStore((state) => state.call);
  const setCall = useCallStore((state) => state.setCall);

  const changeRingingStatus = useCallStore(
    (state) => state.changeRingingStatus
  );
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "call-store") {
        const newCall = JSON.parse(event.newValue || "{}");
        setCall(newCall);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setCall]);

  useEffect(() => {
    const width = Math.floor(window.innerWidth * 0.8);
    const height = Math.floor(window.innerHeight * 0.8);
    setDimensions({ width, height });
  }, []);

  useEffect(() => {
    socket.on("receiveCall", (signalData, otherMember, conversationId) => {
      if (call.status === "busy") return;
      setCall({
        isRinging: true,
        otherMember,
        status: "busy",
        signalData,
        conversationId,
      });
    });
    return () => {
      socket.off("receiveCall");
    };
  }, [socket, setCall, call.status]);
  if (!call.isRinging) return null;

  const handelAcceptCall = () => {
    changeRingingStatus(false);
    window.open(
      `/videoCall?conversationId=${call.conversationId}`,
      "_blank",
      `width=${dimensions.width},height=${dimensions.height}`
    );
  };

  const handdleRejectCall = () => {
    socket.emit("rejectCall", call.conversationId);
    setCall({
      isRinging: false,
      otherMember: { id: "", name: "", email: "" },
      status: "free",
      signalData: null,
      conversationId: null,
    });
  };
  return (
    <Dialog open={call.isRinging}>
      <DialogContent className="md:max-w-xs">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            You have an incoming call from {call.otherMember.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-12 items-center w-full justify-center">
          <Button
            onClick={handelAcceptCall}
            size="sm"
            className="w-10 h-10 rounded-full p-2 bg-green-500 hover:bg-green-600 text-white shadow-md flex items-center justify-center"
          >
            <Phone size={20} />
          </Button>
          <Button
            onClick={handdleRejectCall}
            size="sm"
            className="w-10 h-10 rounded-full p-2 bg-red-500 hover:bg-red-600 text-white shadow-md flex items-center justify-center"
          >
            <PhoneOff size={20} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ComingCallDialog;
