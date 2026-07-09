import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomManager } from "./rooms/RoomManager";
import { setupSocketHandlers } from "./socket/socketHandlers";
import { ClientToServerEvents, ServerToClientEvents } from "./types";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const roomManager = new RoomManager();

setupSocketHandlers(io, roomManager);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", rooms: roomManager.getAllRooms().length });
});

app.get("/api/rooms", (_req, res) => {
  res.json(roomManager.getAllRooms());
});

server.listen(PORT, () => {
  console.log(`WeSync server running on port ${PORT}`);
});
