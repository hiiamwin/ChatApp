"use client";
import { Button } from "@/components/ui/button";
import { useCallStore } from "@/store/CallStore";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

type VideoScreenProps = {
  conversationId: string;
  userId: string;
  socketUrl: string;
};

const call = useCallStore.getState().call;
const setCall = useCallStore.getState().setCall;
function VideoScreen({ conversationId, userId, socketUrl }: VideoScreenProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRejectCall, setIsRejectCall] = useState(false);
  const [isEndCall, setIsEndCall] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

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
    const socket = io(socketUrl, {
      reconnection: true,
    });
    socket.auth = { userId, conversationId };
    setSocket(socket);

    socket?.on("receiveRejectCall", () => {
      setIsRejectCall(true);

      setTimeout(() => {
        window.close();
      }, 2000);
    });

    socket?.on("receiveEndCall", () => {
      setIsEndCall(true);

      setTimeout(() => {
        window.close();
      }, 2000);
    });

    return () => {
      socket?.disconnect();
      socket?.off("receiveRejectCall");
      socket?.off("endCall");
    };
  }, [conversationId, socketUrl, userId]);

  // Tạo và quản lý Peer Connection
  useEffect(() => {
    if (!socket) return;
    const setupPeerConnection = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localVideoRef.current!.srcObject = stream;
      streamRef.current = stream;

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

        config: { iceServers },
      });
      console.log("peer", peer);

      peerRef.current = peer;

      if (isInitiator) {
        peer.on("signal", (offer) => {
          console.log("offer", offer);

          socket?.emit("makeCall", {
            signalData: offer,
            conversationId,
            otherMember: call.otherMember,
          });
        });

        socket?.on("receiveAnswer", (answer) => {
          console.log("answer", answer);

          if (!peer.destroyed) peer.signal(answer);
        });
      } else {
        peer.on("signal", (answer) => {
          console.log("answer", answer);

          socket?.emit("answerCall", {
            signalData: answer,
            conversationId,
          });
        });
        console.log("call.signalData", call.signalData);

        if (call.signalData) peer.signal(call.signalData);
      }

      peer.on("error", (err) => console.error("Peer error:", err));
      peer.on("connect", () => {
        setIsConnected(true);
      });
      peer.on("close", () => {
        setIsEndCall(true);
        setTimeout(() => {
          window.close();
        }, 2000);
      });

      peer.on("stream", (remoteStream) => {
        remoteVideoRef.current!.srcObject = remoteStream;
      });
    };

    setupPeerConnection();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      socket?.off("receiveAnswer");
    };
  }, [conversationId, socket]);

  const handleEndCall = () => {
    setIsEndCall(true);

    socket?.emit("endCall", conversationId);

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

  const handleToggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn((prev) => !prev);
      }
    }
  };

  const handleToggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn((prev) => !prev);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full mx-auto overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <p className="text-xl">Connecting...</p>
          </div>
        )}
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
          variant={isCameraOn ? "default" : "destructive"}
          onClick={handleToggleCamera}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          {isCameraOn ? <Video /> : <VideoOff />}
        </Button>
        <Button
          variant="destructive"
          onClick={handleEndCall}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          <PhoneOff />
        </Button>
        <Button
          variant={isMicOn ? "default" : "destructive"}
          onClick={handleToggleMic}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          {isMicOn ? <Mic /> : <MicOff />}
        </Button>
      </div>
    </div>
  );
}

export default VideoScreen;
