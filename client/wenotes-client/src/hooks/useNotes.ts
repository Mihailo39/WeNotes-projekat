import { useState, useEffect, useCallback } from 'react';
import { noteService } from '../api/services/noteService';
import type { NoteCard, CreateNoteData, UpdateNoteData } from '../types/note';
import { useAuth } from './useAuth';
import { LIMITS } from '../constants/limits';

/**
 * Custom hook za upravljanje beleškama
 * Centralizuje logiku za CRUD operacije sa beleškama
 */
export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Učitaj beleške
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userNotes = await noteService.getUserNotes();
      setNotes(userNotes);
    } catch (err: any) {
      console.error('Greška pri učitavanju beleški:', err);
      setError(err.message || 'Greška pri učitavanju beleški');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kreiraj novu belešku
  const createNote = useCallback(async (data: CreateNoteData) => {
    try {
      setError(null);
      
      // Proveri limit za obične korisnike
      if (user?.role === 'user' && notes.length >= LIMITS.FREE_NOTES) {
        throw new Error('Ne možete kreirati više beleški od 10.');
      }

      const newNote = await noteService.createNote(data);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Greška pri kreiranju beleške';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user, notes.length]);

  // Ažuriraj belešku
  const updateNote = useCallback(async (id: number, data: UpdateNoteData) => {
    try {
      setError(null);
      const updatedNote = await noteService.updateNote(id, data);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Greška pri ažuriranju beleške';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Obriši belešku
  const deleteNote = useCallback(async (id: number) => {
    try {
      setError(null);
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err: any) {
      const errorMessage = err.message || 'Greška pri brisanju beleške';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Toggle pin beleške
  const togglePin = useCallback(async (id: number) => {
    try {
      setError(null);
      const updatedNote = await noteService.togglePin(id);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Greška pri pin-ovanju beleške';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Duplikuj belešku
  const duplicateNote = useCallback(async (id: number) => {
    try {
      setError(null);
      
      // Proveri limit za obične korisnike
      if (user?.role === 'user' && notes.length >= LIMITS.FREE_NOTES) {
        throw new Error('Ne možete kreirati više beleški od 10.');
      }

      const duplicatedNote = await noteService.duplicateNote(id);
      setNotes(prev => [duplicatedNote, ...prev]);
      return duplicatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Greška pri kopiranju beleške';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user, notes.length]);

  // Podeli belešku
  const shareNote = useCallback(async (id: number) => {
    try {
      setError(null);
      const sharedNote = await noteService.shareNote(id);
      
      // Ažuriraj belešku sa novim shared statusom
      setNotes(prev => prev.map(note => 
        note.id === id ? sharedNote.note : note
      ));
      
      return sharedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Greška pri deljenju beleške';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Učitaj beleške pri mount-u
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Izračunaj statistike
  const pinnedNotes = notes.filter(note => note.isPinned);
  const regularNotes = notes.filter(note => !note.isPinned);
  const maxNotes = user?.role === 'user' ? LIMITS.FREE_NOTES : Infinity;
  const remainingNotes = maxNotes - notes.length;

  return {
    // Stanje
    notes,
    pinnedNotes,
    regularNotes,
    isLoading,
    error,
    
    // Statistike
    maxNotes,
    remainingNotes,
    
    // Akcije
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    duplicateNote,
    shareNote,
    
    // Utility funkcije
    clearError: () => setError(null)
  };
};
