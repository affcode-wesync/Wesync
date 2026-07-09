import { Room, Participant, ChatMessage, VideoState } from "../types";
import { generateRoomId, generateId } from "../utils/uuid";

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  getOrCreateRoom(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        participants: new Map(),
        chat: [],
        videoState: {
          videoId: "",
          currentTime: 0,
          isPlaying: false,
          playbackRate: 1,
        },
        leaderId: null,
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, nickname: string): { room: Room; participant: Participant } {
    const room = this.getOrCreateRoom(roomId);

    const participant: Participant = {
      id: generateId(),
      nickname,
      isSpeaking: false,
      isMuted: false,
    };

    room.participants.set(participant.id, participant);

    if (!room.leaderId) {
      room.leaderId = participant.id;
    }

    return { room, participant };
  }

  leaveRoom(roomId: string, participantId: string): { room: Room; wasLeader: boolean; newLeaderId: string | null } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const wasLeader = room.leaderId === participantId;
    room.participants.delete(participantId);

    let newLeaderId = room.leaderId;
    if (wasLeader) {
      const remaining = Array.from(room.participants.values());
      newLeaderId = remaining.length > 0 ? remaining[0].id : null;
      room.leaderId = newLeaderId;
    }

    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      return { room, wasLeader, newLeaderId: null };
    }

    return { room, wasLeader, newLeaderId };
  }

  addChatMessage(roomId: string, nickname: string, text: string, image?: string): ChatMessage | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message: ChatMessage = {
      id: generateId(),
      nickname,
      text: text || "",
      image,
      timestamp: Date.now(),
    };

    room.chat.push(message);
    if (room.chat.length > 200) {
      room.chat = room.chat.slice(-200);
    }

    return message;
  }

  updateVideoState(roomId: string, state: Partial<VideoState>): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.videoState = { ...room.videoState, ...state };
  }

  getVideoState(roomId: string): VideoState | undefined {
    return this.rooms.get(roomId)?.videoState;
  }

  isLeader(roomId: string, participantId: string): boolean {
    const room = this.rooms.get(roomId);
    return room?.leaderId === participantId;
  }

  getParticipant(roomId: string, participantId: string): Participant | undefined {
    return this.rooms.get(roomId)?.participants.get(participantId);
  }

  getRoomParticipantCount(roomId: string): number {
    return this.rooms.get(roomId)?.participants.size ?? 0;
  }

  getAllRooms(): { id: string; participants: number; createdAt: number }[] {
    return Array.from(this.rooms.values()).map((r) => ({
      id: r.id,
      participants: r.participants.size,
      createdAt: r.createdAt,
    }));
  }
}
