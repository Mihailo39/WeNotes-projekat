import axiosClient from '../axiosClient';
import type { NoteCard, CreateNoteData, UpdateNoteData, SharedNoteResponse } from '../../types/note';

export const noteService = {
  // Dohvati sve beleške korisnika
  async getUserNotes(): Promise<NoteCard[]> {
    const response = await axiosClient.get('/notes');
    return response.data.data;
  },

  // Dohvati belešku po ID-u
  async getNoteById(id: number): Promise<NoteCard> {
    const response = await axiosClient.get(`/notes/${id}`);
    return response.data.data;
  },

  // Kreiraj novu belešku
  async createNote(data: CreateNoteData): Promise<NoteCard> {
    const response = await axiosClient.post('/notes', data);
    return response.data.data;
  },

  // Ažuriraj belešku
  async updateNote(id: number, data: UpdateNoteData): Promise<NoteCard> {
    const response = await axiosClient.patch(`/notes/${id}`, data);
    return response.data.data;
  },

  // Obriši belešku
  async deleteNote(id: number): Promise<void> {
    await axiosClient.delete(`/notes/${id}`);
  },

  // Toggle pin beleške
  async togglePin(id: number): Promise<NoteCard> {
    const response = await axiosClient.post(`/notes/${id}/toggle-pin`);
    return response.data.data;
  },

  // Duplikuj belešku
  async duplicateNote(id: number): Promise<NoteCard> {
    const response = await axiosClient.post(`/notes/${id}/duplicate`);
    return response.data.data;
  },

  // Podeli belešku
  async shareNote(id: number): Promise<SharedNoteResponse> {
    const response = await axiosClient.post(`/notes/${id}/share`);
    return response.data.data;
  },

  // Dohvati podeljenu belešku po tokenu
  async getSharedNote(token: string): Promise<NoteCard> {
    const response = await axiosClient.get(`/notes/shared/${token}`);
    return response.data.data;
  }
};
