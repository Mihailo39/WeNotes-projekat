import React, { useState, useEffect } from 'react';
import type { NoteCard, CreateNoteData, UpdateNoteData } from '../../types/note';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface NoteFormProps {
  note?: NoteCard;
  onSubmit: (data: CreateNoteData | UpdateNoteData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        isPublic: note.isPublic,
      });
    }
  }, [note]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Naslov je obavezan';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Sadržaj je obavezan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditing) {
      const updateData: UpdateNoteData = {
        title: formData.title,
        content: formData.content,
        isPublic: formData.isPublic,
      };
      onSubmit(updateData);
    } else {
      const createData: CreateNoteData = {
        title: formData.title,
        content: formData.content,
        isPublic: formData.isPublic,
      };
      onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Naslov beleške"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Unesite naslov beleške"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sadržaj beleške
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={8}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.content 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
          placeholder="Unesite sadržaj beleške..."
          required
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
          Javna beleška
        </label>
        <div className="ml-2">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Otkaži
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {isEditing ? 'Ažuriraj' : 'Kreiraj'} belešku
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;
