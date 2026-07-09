export interface Participant {
  id: string;
  nickname: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

export interface ChatMessage {
  id: string;
  nickname: string;
  text: string;
  image?: string;
  timestamp: number;
}

export interface VideoState {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
}

export interface Room {
  id: string;
  participants: Map<string, Participant>;
  chat: ChatMessage[];
  videoState: VideoState;
  leaderId: string | null;
  createdAt: number;
}

export interface ServerToClientEvents {
  "room-joined": (data: {
    roomId: string;
    participants: Participant[];
    chat: ChatMessage[];
    videoState: VideoState;
    leaderId: string | null;
  }) => void;
  "user-joined": (data: { participant: Participant }) => void;
  "user-left": (data: { participantId: string; nickname: string; newLeaderId: string | null }) => void;
  "chat-message": (message: ChatMessage) => void;
  "sync-state": (state: VideoState) => void;
  "play": (data: { participantId: string; nickname: string }) => void;
  "pause": (data: { participantId: string; nickname: string }) => void;
  "seek": (data: { participantId: string; nickname: string; time: number }) => void;
  "load-video": (data: { participantId: string; nickname: string; videoId: string }) => void;
  "voice-signal": (data: { from: string; signal: unknown }) => void;
  "speaking-changed": (data: { participantId: string; isSpeaking: boolean }) => void;
  "mute-changed": (data: { participantId: string; isMuted: boolean }) => void;
  "notification": (data: { text: string; type: "info" | "warning" }) => void;
}

export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; nickname: string }) => void;
  "leave-room": () => void;
  "chat-message": (data: { text?: string; image?: string }) => void;
  "play": (data: { currentTime: number }) => void;
  "pause": (data: { currentTime: number }) => void;
  "seek": (data: { currentTime: number }) => void;
  "load-video": (data: { videoId: string }) => void;
  "voice-signal": (data: { to: string; signal: unknown }) => void;
  "speaking-changed": (data: { isSpeaking: boolean }) => void;
  "mute-changed": (data: { isMuted: boolean }) => void;
}
