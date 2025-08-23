import { Note } from "../Domain/models/Note";

export function ensureOwnership(note: Note | null, userId: number): Note | null {
  if (!note || note.id === 0) return null;
  if (note.userId !== userId) return null;
  return note;
}