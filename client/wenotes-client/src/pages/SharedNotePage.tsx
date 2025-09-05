import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noteService } from '../api/services/noteService';
import type { NoteCard } from '../types/note';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const SharedNotePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState<NoteCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token za deljenje je obavezan');
      setIsLoading(false);
      return;
    }

    const loadSharedNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const sharedNote = await noteService.getSharedNote(token);
        setNote(sharedNote);
      } catch (err: any) {
        console.error('Greška pri učitavanju podeljene beleške:', err);
        setError(err.message || 'Greška pri učitavanju podeljene beleške');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedNote();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="min-h-screen bg-[#edffec] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60cbff] mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavanje podeljene beleške...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#edffec] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Greška pri učitavanju</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => navigate(user ? '/dashboard' : '/')}>
              Povratak na početnu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-[#edffec] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-yellow-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Beleška nije pronađena</h3>
            <p className="text-yellow-700 mb-4">
              Podeljena beleška sa ovim tokenom ne postoji ili je uklonjena.
            </p>
            <Button onClick={() => navigate(user ? '/dashboard' : '/')}>
              Povratak na početnu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edffec]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#60cbff] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">WeNotes</h1>
                <p className="text-sm text-gray-500">Podeljena beleška</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(user ? '/dashboard' : '/')}>
              Povratak na početnu
            </Button>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Note Header */}
          <div className="bg-gradient-to-r from-[#60cbff] to-[#4db8e6] px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">{note.title}</h1>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm">
                  Podeljena
                </span>
                {note.isPinned && (
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    Zakačena
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Note Image */}
          {note.imageUrl && (
            <div className="p-6 pb-0">
              <img 
                src={note.imageUrl} 
                alt={note.title}
                className="w-full max-h-96 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(note.imageUrl!)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Note Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {note.content}
              </div>
            </div>
          </div>

          {/* Note Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Kreirano: {formatDate(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span>Ažurirano: {formatDate(note.updatedAt)}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>Token: {note.sharedToken}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Ova beleška je podeljena sa vama
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Koristite token iznad da pristupite ovoj belešci u budućnosti.
              </p>
            </div>
          </div>
        </div>
      </main>

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

export default SharedNotePage;
