import { Note } from '../../models/Note';
import { NoteCreateDTO } from '../../DTOs/note/NoteCreateDTO';
import { NoteUpdateDTO } from '../../DTOs/note/NoteUpdateDTO';
import { Role } from '../../enum/Role';

export interface INoteService {
    createNote(userId: number, role: Role, noteData: NoteCreateDTO): Promise<Note | null>;
    getAllUserNotes(userId: number): Promise<Note[]>;
    getNoteById(userId: number, noteId: number): Promise<Note | null>;
    getNoteByTitle(userId: number, title: string): Promise<Note | null>;
    updateNote(userId: number, role: Role, noteId: number, noteData: NoteUpdateDTO): Promise<Note | null>;
    deleteNote(userId: number, noteId: number): Promise<boolean>;
    togglePin(userId: number, noteId: number): Promise<Note | null>;
    duplicateNote(userId: number, noteId: number, role: Role): Promise<Note | null>;
    shareNote(userId: number, noteId: number): Promise<Note | null>;
    getSharedNoteByToken(token: string): Promise<Note | null>;
}