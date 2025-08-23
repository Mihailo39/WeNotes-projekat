import React from 'react';
import type { NoteCard as NoteCardType } from '../../types/note';

interface NoteCardProps {
  note: NoteCardType;
  onEdit?: (note: NoteCardType) => void;
  onDelete?: (noteId: number) => void;
  onTogglePin?: (noteId: number) => void;
  onTogglePublic?: (noteId: number) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePublic,
}) => {
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      note.isPinned ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {note.title}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            {note.isPinned && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            )}
            {note.isPublic && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateContent(note.content)}
        </p>
        
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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Izmeni
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(note.id)}
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
                    ? 'text-blue-600 hover:text-blue-800' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={note.isPinned ? 'Ukloni pin' : 'Zakači pin'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            )}
            {onTogglePublic && (
              <button
                onClick={() => onTogglePublic(note.id)}
                className={`p-1 rounded ${
                  note.isPublic 
                    ? 'text-green-600 hover:text-green-800' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={note.isPublic ? 'Učini privatnom' : 'Učini javnom'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
