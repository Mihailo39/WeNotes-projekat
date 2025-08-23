import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import type { NoteCard as NoteCardType, CreateNoteData, UpdateNoteData } from '../types/note';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteCardType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data za demonstraciju
  useEffect(() => {
    const mockNotes: NoteCardType[] = [
      {
        id: 1,
        title: 'Dobrodošli u WeNotes!',
        content: 'Ovo je vaša prva beleška. Možete je izmeniti, obrisati ili učiniti javnom.',
        isPublic: false,
        isPinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Kako koristiti WeNotes',
        content: 'WeNotes je platforma za kreiranje i upravljanje beleškama. Možete kreirati privatne i javne beleške, zakačiti ih pin-om i deliti sa drugima.',
        isPublic: true,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Premium funkcionalnosti',
        content: 'Kao premium korisnik imate pristup naprednim funkcionalnostima kao što su neograničeno kreiranje beleški, napredne opcije za deljenje i više.',
        isPublic: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setTimeout(() => {
      setNotes(mockNotes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateNote = async (data: CreateNoteData) => {
    setIsSubmitting(true);
    
    // Simuliram API poziv
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newNote: NoteCardType = {
      id: Date.now(),
      ...data,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (!editingNote) return;
    
    setIsSubmitting(true);
    
    // Simuliram API poziv
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...note, ...data, updatedAt: new Date().toISOString() }
        : note
    ));
    
    setEditingNote(null);
    setIsSubmitting(false);
  };

  const handleEditNote = (note: NoteCardType) => {
    setEditingNote(note);
  };

  const handleDeleteNote = (noteId: number) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu belešku?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handleTogglePin = (noteId: number) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const handleTogglePublic = (noteId: number) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPublic: !note.isPublic } : note
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const pinnedNotes = notes.filter(note => note.isPinned);
  const regularNotes = notes.filter(note => !note.isPinned);

  return (
    <div className="min-h-screen bg-gray-50">
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
        </div>

        {/* Actions */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <Button onClick={() => setShowCreateModal(true)}>
              Nova beleška
            </Button>
            <Button variant="outline">
              Filtriraj
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Ukupno beleški: {notes.length}
          </div>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
                  onTogglePublic={handleTogglePublic}
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
                  onTogglePublic={handleTogglePublic}
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
              <Button onClick={() => setShowCreateModal(true)}>
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
          onSubmit={(data) => handleCreateNote(data as CreateNoteData)}
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
            onSubmit={(data) => handleUpdateNote(data as UpdateNoteData)}
            onCancel={() => setEditingNote(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
