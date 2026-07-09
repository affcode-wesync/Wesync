import { v4 as uuidv4 } from "uuid";

export function generateRoomId(): string {
  return uuidv4();
}

export function generateId(): string {
  return uuidv4();
}
