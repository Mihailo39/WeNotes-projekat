import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { noteService } from '../api/services/noteService';
import type { NoteCard as NoteCardType, CreateNoteData, UpdateNoteData } from '../types/note';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteCardType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Učitaj beleške iz baze
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userNotes = await noteService.getUserNotes();
      setNotes(userNotes);
    } catch (err) {
      console.error('Greška pri učitavanju beleški:', err);
      setError('Greška pri učitavanju beleški');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = async (data: CreateNoteData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Proveri limit za obične korisnike
      if (user?.role === 'user' && notes.length >= 10) {
        setError('Obični korisnici mogu imati maksimalno 10 beleški. Nadogradite na premium za neograničeno kreiranje.');
        return;
      }

      const newNote = await noteService.createNote(data);
      setNotes(prev => [newNote, ...prev]);
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Greška pri kreiranju beleške:', err);
      setError(err.message || 'Greška pri kreiranju beleške');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (!editingNote) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedNote = await noteService.updateNote(editingNote.id, data);
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      
      setEditingNote(null);
    } catch (err: any) {
      console.error('Greška pri ažuriranju beleške:', err);
      setError(err.message || 'Greška pri ažuriranju beleške');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = (note: NoteCardType) => {
    setEditingNote(note);
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await noteService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Greška pri brisanju beleške:', err);
      setError(err.message || 'Greška pri brisanju beleške');
    }
  };

  const handleTogglePin = async (noteId: number) => {
    try {
      const updatedNote = await noteService.togglePin(noteId);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
    } catch (err: any) {
      console.error('Greška pri pin-ovanju beleške:', err);
      setError(err.message || 'Greška pri pin-ovanju beleške');
    }
  };

  const handleCopyNote = async (noteId: number) => {
    try {
      const duplicatedNote = await noteService.duplicateNote(noteId);
      setNotes(prev => [duplicatedNote, ...prev]);
    } catch (err: any) {
      console.error('Greška pri kopiranju beleške:', err);
      setError(err.message || 'Greška pri kopiranju beleške');
    }
  };

  const handleShareNote = async (noteId: number) => {
    try {
      const sharedNote = await noteService.shareNote(noteId);
      // Ažuriraj belešku sa novim shared statusom
      setNotes(prev => prev.map(note => 
        note.id === noteId ? sharedNote.note : note
      ));
      
      // Kopiraj token u clipboard
      if (sharedNote.sharedToken) {
        const shareUrl = `${window.location.origin}/shared/${sharedNote.sharedToken}`;
        await navigator.clipboard.writeText(shareUrl);
        alert(`Token je kopiran u clipboard!\n\nURL za deljenje: ${shareUrl}`);
      }
    } catch (err: any) {
      console.error('Greška pri deljenju beleške:', err);
      setError(err.message || 'Greška pri deljenju beleške');
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#edffec]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60cbff]"></div>
          </div>
        </div>
      </div>
    );
  }

  const pinnedNotes = notes.filter(note => note.isPinned);
  const regularNotes = notes.filter(note => !note.isPinned);
  const maxNotes = user?.role === 'user' ? 10 : Infinity;
  const remainingNotes = maxNotes - notes.length;

  return (
    <div className="min-h-screen bg-[#edffec]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dobrodošli, {user?.username}! 👋
          </h2>
          <p className="text-gray-600">
            Upravljajte svojim beleškama i organizujte svoje ideje
          </p>
          {user?.role === 'user' && (
            <div className="mt-2 text-sm text-gray-500">
              Preostalo beleški: {remainingNotes} od {maxNotes}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <Button 
              onClick={() => setShowCreateModal(true)}
              disabled={user?.role === 'user' && notes.length >= 10}
            >
              Nova beleška
            </Button>
            {user?.role === 'user' && notes.length >= 10 && (
              <span className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Dostigli ste limit od 10 beleški
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Ukupno beleški: {notes.length}
            {user?.role === 'user' && (
              <span className="ml-2 text-blue-600">
                (Limit: {maxNotes})
              </span>
            )}
          </div>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-[#60cbff] mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Zakačene beleške
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                  onShare={handleShareNote}
                  onCopy={handleCopyNote}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sve beleške</h3>
          {regularNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                  onShare={handleShareNote}
                  onCopy={handleCopyNote}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nema beleški</h3>
              <p className="text-gray-500 mb-4">Kreirajte svoju prvu belešku da počnete</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                disabled={user?.role === 'user' && notes.length >= 10}
              >
                Kreiraj belešku
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Note Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova beleška"
        size="lg"
      >
        <NoteForm
          onSubmit={handleCreateNote}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        title="Izmeni belešku"
        size="lg"
      >
        {editingNote && (
          <NoteForm
            note={editingNote}
            onSubmit={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={handleCloseImageModal}
        title="Pregled slike"
        size="lg"
      >
        {selectedImage && (
          <div className="text-center">
            <img
              src={selectedImage}
              alt="Pregled slike"
              className="max-w-full max-h-96 object-contain mx-auto rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
