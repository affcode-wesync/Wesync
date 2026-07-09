import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
