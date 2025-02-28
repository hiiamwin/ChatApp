"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { UserType } from "@/types";
import { useCallStore } from "@/store/CallStore";

type VideoCallButtonProps = {
  member: UserType;
  conversationId: string;
};
function VideoCallButton({ member, conversationId }: VideoCallButtonProps) {
  const call = useCallStore((state) => state.call);
  const setCall = useCallStore((state) => state.setCall);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const width = Math.floor(window.innerWidth * 0.8);
    const height = Math.floor(window.innerHeight * 0.8);
    setDimensions({ width, height });
  }, []);

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

  const handleSendCall = async () => {
    setCall({
      isRinging: false,
      otherMember: member,
      status: "busy",
      signalData: null,
      conversationId,
    });

    window.open(
      `/videoCall?conversationId=${conversationId}`,
      "_blank",
      `width=${dimensions.width},height=${dimensions.height}`
    );
  };

  return (
    <Button
      size={"icon"}
      onClick={handleSendCall}
      disabled={call.isRinging || call.status === "busy"}
    >
      <Video />
    </Button>
  );
}

export default VideoCallButton;
