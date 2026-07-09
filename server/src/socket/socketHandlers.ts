import { Server, Socket } from "socket.io";
import { RoomManager } from "../rooms/RoomManager";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer, roomManager: RoomManager): void {
  io.on("connection", (socket: TypedSocket) => {
    let currentRoomId: string | null = null;
    let currentParticipantId: string | null = null;
    let currentNickname: string | null = null;

    socket.on("join-room", ({ roomId, nickname }) => {
      if (currentRoomId) {
        socket.leave(currentRoomId);
        const left = roomManager.leaveRoom(currentRoomId, currentParticipantId!);
        if (left) {
          io.to(currentRoomId).emit("user-left", {
            participantId: currentParticipantId!,
            nickname: currentNickname!,
            newLeaderId: left.newLeaderId,
          });
          io.to(currentRoomId).emit("notification", {
            text: `${currentNickname} вышел из комнаты`,
            type: "info",
          });
        }
      }

      currentRoomId = roomId;
      currentNickname = nickname;

      const { room, participant } = roomManager.joinRoom(roomId, nickname);
      currentParticipantId = participant.id;
      socket.join(roomId);

      const participants = Array.from(room.participants.values());

      socket.emit("room-joined", {
        roomId,
        participants,
        chat: room.chat.slice(-50),
        videoState: room.videoState,
        leaderId: room.leaderId,
      });

      socket.to(roomId).emit("user-joined", { participant });
      socket.to(roomId).emit("notification", {
        text: `${nickname} присоединился`,
        type: "info",
      });
    });

    socket.on("leave-room", () => {
      if (!currentRoomId || !currentParticipantId) return;

      const left = roomManager.leaveRoom(currentRoomId, currentParticipantId);
      if (left) {
        io.to(currentRoomId).emit("user-left", {
          participantId: currentParticipantId,
          nickname: currentNickname!,
          newLeaderId: left.newLeaderId,
        });
        io.to(currentRoomId).emit("notification", {
          text: `${currentNickname} вышел из комнаты`,
          type: "info",
        });
      }

      socket.leave(currentRoomId);
      currentRoomId = null;
      currentParticipantId = null;
      currentNickname = null;
    });

    socket.on("chat-message", ({ text, image }) => {
      if (!currentRoomId || !currentNickname) return;
      if (!text && !image) return;
      const message = roomManager.addChatMessage(currentRoomId, currentNickname, text || "", image);
      if (message) {
        io.to(currentRoomId).emit("chat-message", message);
      }
    });

    socket.on("play", ({ currentTime }) => {
      if (!currentRoomId || !currentParticipantId) return;
      roomManager.updateVideoState(currentRoomId, { isPlaying: true, currentTime });
      socket.to(currentRoomId).emit("play", {
        participantId: currentParticipantId,
        nickname: currentNickname!,
      });
      socket.to(currentRoomId).emit("sync-state", {
        ...roomManager.getVideoState(currentRoomId)!,
        currentTime,
        isPlaying: true,
      });
    });

    socket.on("pause", ({ currentTime }) => {
      if (!currentRoomId || !currentParticipantId) return;
      roomManager.updateVideoState(currentRoomId, { isPlaying: false, currentTime });
      socket.to(currentRoomId).emit("pause", {
        participantId: currentParticipantId,
        nickname: currentNickname!,
      });
      socket.to(currentRoomId).emit("sync-state", {
        ...roomManager.getVideoState(currentRoomId)!,
        currentTime,
        isPlaying: false,
      });
    });

    socket.on("seek", ({ currentTime }) => {
      if (!currentRoomId || !currentParticipantId) return;
      roomManager.updateVideoState(currentRoomId, { currentTime });
      socket.to(currentRoomId).emit("seek", {
        participantId: currentParticipantId,
        nickname: currentNickname!,
        time: currentTime,
      });
      socket.to(currentRoomId).emit("sync-state", {
        ...roomManager.getVideoState(currentRoomId)!,
        currentTime,
      });
    });

    socket.on("load-video", ({ videoId }) => {
      if (!currentRoomId || !currentParticipantId) return;
      roomManager.updateVideoState(currentRoomId, {
        videoId,
        currentTime: 0,
        isPlaying: true,
      });
      io.to(currentRoomId).emit("load-video", {
        participantId: currentParticipantId,
        nickname: currentNickname!,
        videoId,
      });
      io.to(currentRoomId).emit("sync-state", {
        videoId,
        currentTime: 0,
        isPlaying: true,
        playbackRate: 1,
      });
    });

    socket.on("voice-signal", ({ to, signal }) => {
      io.to(to).emit("voice-signal", {
        from: socket.id,
        signal,
      });
    });

    socket.on("speaking-changed", ({ isSpeaking }) => {
      if (!currentRoomId || !currentParticipantId) return;
      const participant = roomManager.getParticipant(currentRoomId, currentParticipantId);
      if (participant) {
        participant.isSpeaking = isSpeaking;
      }
      socket.to(currentRoomId).emit("speaking-changed", {
        participantId: currentParticipantId,
        isSpeaking,
      });
    });

    socket.on("mute-changed", ({ isMuted }) => {
      if (!currentRoomId || !currentParticipantId) return;
      const participant = roomManager.getParticipant(currentRoomId, currentParticipantId);
      if (participant) {
        participant.isMuted = isMuted;
      }
      socket.to(currentRoomId).emit("mute-changed", {
        participantId: currentParticipantId,
        isMuted,
      });
    });

    socket.on("disconnect", () => {
      if (!currentRoomId || !currentParticipantId) return;

      const left = roomManager.leaveRoom(currentRoomId, currentParticipantId);
      if (left) {
        io.to(currentRoomId).emit("user-left", {
          participantId: currentParticipantId,
          nickname: currentNickname!,
          newLeaderId: left.newLeaderId,
        });
        io.to(currentRoomId).emit("notification", {
          text: `${currentNickname} отключился`,
          type: "info",
        });
      }
    });
  });
}
