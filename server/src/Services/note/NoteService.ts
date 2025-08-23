import { INoteService } from "../../Domain/services/note/INoteService";
import { INoteRepository } from "../../Domain/repositories/notes/INoteRepository";
import { Note } from "../../Domain/models/Note";
import { Role } from "../../Domain/enum/Role";
import { NoteCreateDTO } from "../../Domain/DTOs/note/NoteCreateDTO";
import { NoteUpdateDTO } from "../../Domain/DTOs/note/NoteUpdateDTO";
import { randomUUID } from "crypto";
import { ensureOwnership } from "../../utils/ownership";
import { dataValidationNoteCreate, dataValidationNoteUpdate } from "../../WebAPI/validators/note/NoteValidator";
import { normalizeTitle } from "../../utils/note";
import { NoteCardDTO } from "../../Domain/DTOs/note/NoteCardDTO";
import { ListNotesQuery } from "../../WebAPI/validators/common/QueryValidators";
export class NoteService implements INoteService{
    
    private readonly FREE_NOTES_LIMIT = 10;

    constructor(private noteRepository: INoteRepository) {}

    async createNote(userId: number, role: Role, noteData: NoteCreateDTO): Promise<Note | null> {
        const valid = dataValidationNoteCreate(
            noteData.title,
            noteData.content,
            noteData.imageUrl ?? null,
            role
        );

        if (!valid.success) {
            return null;
        }

        if (role === Role.User) {
            const existing = await this.noteRepository.getAllByUserId(userId);
            if (existing.length >= this.FREE_NOTES_LIMIT) {
                return null;
            }
        }

        const cleanTitle = normalizeTitle(noteData.title);

        const toCreate = new Note(
            0,
            userId,
            cleanTitle,
            noteData.content,
            role === Role.Premium ? (noteData.imageUrl ?? null) : null,
            false, //isPinned
            false, //isShared
            null
        );

        return await this.noteRepository.create(toCreate);
    }
    
    async getAllUserNotes(userId: number): Promise<Note[]> {
        return this.noteRepository.getAllByUserId(userId);
    }

    
    async getNoteById(userId: number, noteId: number): Promise<Note | null> {
        const note = await this.noteRepository.getById(noteId);
        return ensureOwnership(note, userId);
    }

    async getNoteByTitle(userId: number, title: string): Promise<Note | null> {
        const note = await this.noteRepository.getByTitle(userId, title);
        return ensureOwnership(note, userId);
    }

    async getNotesByTitle(userId: number, title: string): Promise<Note[]> {
        const list = await this.noteRepository.getAllByTitle(userId, title);
        return list.filter(n => ensureOwnership(n, userId));
    }

    async updateNote(userId: number, role: Role, noteId: number, noteData: NoteUpdateDTO): Promise<Note | null> {
        const existingNote = await this.noteRepository.getById(noteId);
        const owned = ensureOwnership(existingNote, userId);

        if (!owned){
            return owned;
        }

        const valid = dataValidationNoteUpdate(
            noteData.title,
            noteData.content,
            noteData.imageUrl ?? null,
            role
        );

        if(!valid.success) {
            return null;
        }

        if (noteData.title !== undefined) {
            owned.title = noteData.title;
        }

        if (noteData.content !== undefined) {
            owned.content = noteData.content;
        }

        if (role === Role.Premium && noteData.imageUrl !== undefined) {
            owned.imageUrl = noteData.imageUrl;
        }

        return this.noteRepository.update(owned);
    }

    async deleteNote(userId: number, noteId: number): Promise<boolean> {
        const note = await this.noteRepository.getById(noteId);
        const owned = ensureOwnership(note, userId);
        if (!owned){
            return false;
        }
        return this.noteRepository.delete(noteId);
    }

    async togglePin(userId: number, noteId: number): Promise<Note | null> {
        const note = await this.noteRepository.getById(noteId);
        const owned = ensureOwnership(note, userId);

        if(!owned){
            return null;
        }

        owned.isPinned = !owned.isPinned;
        return this.noteRepository.update(owned);
    }

    async duplicateNote(userId: number, noteId: number, role: Role): Promise<Note | null> {
        const note = await this.noteRepository.getById(noteId);
        const owned = ensureOwnership(note, userId);

        if (!owned) {
            return null;
        }

        if (role === Role.User) {
            const existing = await this.noteRepository.getAllByUserId(userId);
            if (existing.length >= this.FREE_NOTES_LIMIT) {
                return null;
            }
        }

        const duplicated = await this.noteRepository.duplicate(noteId);

        const duplicatedOwned = ensureOwnership(duplicated, userId);
        return duplicatedOwned ?? null;
    }

    async shareNote(userId: number, noteId: number): Promise<Note | null> {
        const note = await this.noteRepository.getById(noteId);
        const owned = ensureOwnership(note, userId);

        if (!owned) {
            return null;
        }

        owned.isShared = true;
        owned.sharedToken = randomUUID();
        return this.noteRepository.update(owned);
    }

    async getSharedNoteByToken(token: string): Promise<Note | null> {
        const note = await this.noteRepository.getShared(token);
        return note ?? null;
    }
}