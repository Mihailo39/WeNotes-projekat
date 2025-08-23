import { Note } from '../../models/Note';

export interface INoteRepository {
  create(note: Note): Promise<Note>;
  getById(id: number): Promise<Note | null>;
  getByTitle(userId: number, title: string): Promise<Note | null>;
  getAllByTitle(userId: number, title: string): Promise<Note[]>;
  getAllByUserId(userId: number): Promise<Note[]>;
  getShared(sharedToken: string): Promise<Note | null>;
  update(note: Note): Promise<Note | null>;
  delete(id: number): Promise<boolean>;
  duplicate(noteId: number): Promise<Note | null>;
}