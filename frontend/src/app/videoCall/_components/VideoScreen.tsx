"use client";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/providers/socket-provider";
import { useCallStore } from "@/store/CallStore";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

type VideoScreenProps = {
  conversationId: string;
  userId: string;
};

const call = useCallStore.getState().call;
const setCall = useCallStore.getState().setCall;
function VideoScreen({ conversationId, userId }: VideoScreenProps) {
  const { socket } = useSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  // const call = useCallStore((state) => state.call);
  // const setCall = useCallStore((state) => state.setCall);
  const [isRejectCall, setIsRejectCall] = useState(false);
  const [isEndCall, setIsEndCall] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setCall({
        isRinging: false,
        otherMember: { id: "", name: "", email: "" },
        status: "free",
        signalData: null,
        conversationId: null,
      });

      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Kết nối socket
  useEffect(() => {
    socket.auth = { userId, conversationId };
    socket.connect();
    socket.on("receiveRejectCall", () => {
      setIsRejectCall(true);

      setTimeout(() => {
        window.close();
      }, 2000);
    });

    socket.on("receiveEndCall", () => {
      setIsEndCall(true);

      setTimeout(() => {
        window.close();
      }, 2000);
    });
    return () => {
      socket.disconnect();
      socket.off("receiveRejectCall");
      socket.off("endCall");
    };
  }, [conversationId, socket, userId]);

  // Tạo và quản lý Peer Connection
  useEffect(() => {
    const setupPeerConnection = async () => {
      // Cleanup peer cũ nếu tồn tại
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localVideoRef.current!.srcObject = stream;
      // if (peerRef.current) {
      //   peerRef.current.destroy();
      //   peerRef.current = null;
      // }

      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ];
      const isInitiator = call.signalData == null ? true : false; // Người gọi nếu không có signalData
      console.log("isInitiator", isInitiator);

      const peer = new Peer({
        initiator: isInitiator,
        trickle: false,
        stream,
        // stream: streamRef.current as MediaStream,
        config: { iceServers },
      });
      console.log("peer", peer);

      peerRef.current = peer;

      // Xử lý khi là người gọi (initiator)
      if (isInitiator) {
        peer.on("signal", (offer) => {
          console.log("offer", offer);

          socket.emit("makeCall", {
            signalData: offer,
            conversationId,
            otherMember: call.otherMember,
          });
        });

        // Lắng nghe answer từ người nhận
        socket.on("receiveAnswer", (answer) => {
          console.log("answer", answer);

          if (!peer.destroyed) peer.signal(answer);
        });
      }
      // Xử lý khi là người nhận
      else {
        peer.on("signal", (answer) => {
          console.log("answer", answer);

          socket.emit("answerCall", {
            signalData: answer,
            conversationId,
          });
        });
        console.log("call.signalData", call.signalData);

        // Feed offer vào peer
        if (call.signalData) peer.signal(call.signalData);
      }

      // Xử lý stream từ remote

      peer.on("error", (err) => console.error("Peer error:", err));
      peer.on("connect", () => console.log("Peer connected"));
      peer.on("close", () => console.log("Peer closed"));

      peer.on("stream", (remoteStream) => {
        remoteVideoRef.current!.srcObject = remoteStream;
      });
    };

    setupPeerConnection();

    // Cleanup
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      socket.off("receiveAnswer");
    };
  }, [conversationId, isRejectCall, socket]);

  const handleEndCall = () => {
    setIsEndCall(true);

    socket.emit("endCall", conversationId);

    setTimeout(() => {
      window.close();
    }, 2000);
  };

  if (isEndCall) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">Call Ended</h1>
      </div>
    );
  }

  if (isRejectCall) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">Call Rejected</h1>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full mx-auto overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute w-72 h-40 md:w-96 md:h-56 rounded-lg overflow-hidden top-4 right-4 border-2 border-white shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4 bg-black/50">
        <Button
          // variant={isCameraOn ? "default" : "destructive"}
          // onClick={toggleCamera}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          {/* {isCameraOn ? "📹" : "🚫"} */}
          📹
        </Button>
        <Button
          variant="destructive"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          📞
        </Button>
        <Button
          // variant={isMicOn ? "default" : "destructive"}
          // onClick={toggleMic}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          {/* {isMicOn ? "🎤" : "🔇"} */}
          🎤
        </Button>
      </div>
    </div>
  );
}

export default VideoScreen;
