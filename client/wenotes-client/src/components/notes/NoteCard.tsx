import React, { useState } from 'react';
import type { NoteCard as NoteCardType } from '../../types/note';

interface NoteCardProps {
  note: NoteCardType;
  onEdit?: (note: NoteCardType) => void;
  onDelete?: (noteId: number) => void;
  onTogglePin?: (noteId: number) => void;
  onShare?: (noteId: number) => Promise<void>;
  onCopy?: (noteId: number) => Promise<void>;
  onImageClick?: (imageUrl: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onShare,
  onCopy,
  onImageClick,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleShare = async () => {
    if (!onShare) return;
    
    if (window.confirm('Da li ste sigurni da želite da podelite ovu belešku?')) {
      setIsSharing(true);
      try {
        await onShare(note.id);
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handleCopy = async () => {
    if (!onCopy) return;
    
    if (window.confirm('Da li ste sigurni da želite da kopirate ovu belešku?')) {
      setIsCopying(true);
      try {
        await onCopy(note.id);
      } finally {
        setIsCopying(false);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Da li ste sigurni da želite da obrišete ovu belešku?')) {
      onDelete(note.id);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      note.isPinned ? 'border-[#60cbff] bg-[#edffec]' : 'border-gray-200'
    }`}>
      <div className="p-4">
        {/* Image if exists */}
        {note.imageUrl && (
          <div className="mb-3">
            <img 
              src={note.imageUrl} 
              alt={note.title}
              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick?.(note.imageUrl!)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {note.title}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            {note.isPinned && (
              <svg className="w-4 h-4 text-[#60cbff]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            )}
            {note.isShared && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateContent(note.content)}
        </p>

        {/* Shared token display */}
        {note.isShared && note.sharedToken && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">Token za deljenje:</span>
              <code className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded">
                {note.sharedToken}
              </code>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Kreirano: {formatDate(note.createdAt)}</span>
          {note.updatedAt !== note.createdAt && (
            <span>Ažurirano: {formatDate(note.updatedAt)}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(note)}
                className="text-[#60cbff] hover:text-[#4db8e6] text-sm font-medium"
              >
                Izmeni
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Obriši
              </button>
            )}
          </div>
          
          <div className="flex space-x-1">
            {onTogglePin && (
              <button
                onClick={() => onTogglePin(note.id)}
                className={`p-1 rounded ${
                  note.isPinned 
                    ? 'text-[#60cbff] hover:text-[#4db8e6]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={note.isPinned ? 'Ukloni pin' : 'Zakači pin'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            )}
            {onCopy && (
              <button
                onClick={handleCopy}
                disabled={isCopying}
                className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Kopiraj belešku"
              >
                {isCopying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                )}
              </button>
            )}
            {onShare && (
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Podeli belešku"
              >
                {isSharing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
