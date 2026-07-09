import { useEffect, useRef, useCallback, useState } from "react";
import { getSocket, TypedSocket } from "../services/socket";
import {
  Participant,
  ChatMessage,
  VideoState,
  Notification,
} from "../types";

interface UseSocketReturn {
  socket: TypedSocket | null;
  connected: boolean;
  participants: Participant[];
  chat: ChatMessage[];
  videoState: VideoState;
  leaderId: string | null;
  myParticipantId: string | null;
  notifications: Notification[];
  joinRoom: (roomId: string, nickname: string) => void;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  sendImage: (image: string) => void;
  sendPlay: (currentTime: number) => void;
  sendPause: (currentTime: number) => void;
  sendSeek: (currentTime: number) => void;
  sendLoadVideo: (videoId: string) => void;
  sendVoiceSignal: (to: string, signal: unknown) => void;
  sendSpeakingChanged: (isSpeaking: boolean) => void;
  sendMuteChanged: (isMuted: boolean) => void;
  removeNotification: (id: string) => void;
  setVideoState: React.Dispatch<React.SetStateAction<VideoState>>;
}

export function useSocket(): UseSocketReturn {
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [videoState, setVideoState] = useState<VideoState>({
    videoId: "",
    currentTime: 0,
    isPlaying: false,
    playbackRate: 1,
  });
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const socketRef = useRef<TypedSocket | null>(null);

  const addNotification = useCallback((text: string, type: "info" | "warning" = "info") => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [...prev.slice(-4), { id, text, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("room-joined", (data) => {
      setParticipants(data.participants);
      setChat(data.chat);
      setVideoState(data.videoState);
      setLeaderId(data.leaderId);
      const me = data.participants.find((p) => p.id === socket.id);
      if (me) setMyParticipantId(me.id);
    });

    socket.on("user-joined", ({ participant }) => {
      setParticipants((prev) => [...prev, participant]);
    });

    socket.on("user-left", ({ participantId, newLeaderId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setLeaderId(newLeaderId);
    });

    socket.on("chat-message", (message) => {
      setChat((prev) => [...prev, message]);
    });

    socket.on("sync-state", (state) => {
      setVideoState(state);
    });

    socket.on("notification", ({ text, type }) => {
      addNotification(text, type);
    });

    socket.on("speaking-changed", ({ participantId, isSpeaking }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, isSpeaking } : p))
      );
    });

    socket.on("mute-changed", ({ participantId, isMuted }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, isMuted } : p))
      );
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addNotification]);

  const joinRoom = useCallback((roomId: string, nickname: string) => {
    socketRef.current?.emit("join-room", { roomId, nickname });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("leave-room");
  }, []);

  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit("chat-message", { text });
  }, []);

  const sendImage = useCallback((image: string) => {
    socketRef.current?.emit("chat-message", { image });
  }, []);

  const sendPlay = useCallback((currentTime: number) => {
    socketRef.current?.emit("play", { currentTime });
  }, []);

  const sendPause = useCallback((currentTime: number) => {
    socketRef.current?.emit("pause", { currentTime });
  }, []);

  const sendSeek = useCallback((currentTime: number) => {
    socketRef.current?.emit("seek", { currentTime });
  }, []);

  const sendLoadVideo = useCallback((videoId: string) => {
    socketRef.current?.emit("load-video", { videoId });
  }, []);

  const sendVoiceSignal = useCallback((to: string, signal: unknown) => {
    socketRef.current?.emit("voice-signal", { to, signal });
  }, []);

  const sendSpeakingChanged = useCallback((isSpeaking: boolean) => {
    socketRef.current?.emit("speaking-changed", { isSpeaking });
  }, []);

  const sendMuteChanged = useCallback((isMuted: boolean) => {
    socketRef.current?.emit("mute-changed", { isMuted });
  }, []);

  return {
    socket: socketRef.current,
    connected,
    participants,
    chat,
    videoState,
    leaderId,
    myParticipantId,
    notifications,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendImage,
    sendPlay,
    sendPause,
    sendSeek,
    sendLoadVideo,
    sendVoiceSignal,
    sendSpeakingChanged,
    sendMuteChanged,
    removeNotification,
    setVideoState,
  };
}
