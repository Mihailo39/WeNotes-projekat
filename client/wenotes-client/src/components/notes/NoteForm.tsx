import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { NoteCard, CreateNoteData, UpdateNoteData } from '../../types/note';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

type CreateProps = {
  note?: undefined; // create mod
  onSubmit: (data: CreateNoteData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

type EditProps = {
  note: NoteCard;   // edit mod
  onSubmit: (data: UpdateNoteData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

type NoteFormProps = CreateProps | EditProps;

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isEditing = !!note;
  const isPremium = user?.role === 'premium';

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        imageUrl: note.imageUrl || '',
      });
      setImagePreview(note.imageUrl || null);
    }
  }, [note]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Proveri tip fajla
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Molimo odaberite validnu sliku' }));
        return;
      }
      
      // Proveri veličinu fajla (max 1MB za base64)
      if (file.size > 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Slika ne sme biti veća od 1MB' }));
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL input
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Ako je odabrana slika, konvertuj je u base64
    let imageUrl = formData.imageUrl;
    if (imageFile) {
      try {
        const base64 = await convertToBase64(imageFile);
        imageUrl = base64;
      } catch (err) {
        setErrors(prev => ({ ...prev, image: 'Greška pri konvertovanju slike' }));
        return;
      }
    }

    if (isEditing) {
      const updateData: UpdateNoteData = {
        title: formData.title,
        content: formData.content,
        ...(isPremium && imageUrl && { imageUrl }),
      };
      await onSubmit(updateData);
    } else {
      const createData: CreateNoteData = {
        title: formData.title,
        content: formData.content,
        ...(isPremium && imageUrl && { imageUrl }),
      };
      await onSubmit(createData);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Kompresuj sliku na maksimalno 800x600
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Konvertuj u base64 sa kompresijom
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <>
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
            focus:outline-none focus:ring-2 focus:ring-[#60cbff] focus:border-[#60cbff]
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

      {isPremium && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slika (opciono)
          </label>
          
          {/* File Upload */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#60cbff] file:text-white hover:file:bg-[#4db8e6]"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(imagePreview)}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* URL Input (alternative) */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500 mb-1">
              Ili unesite URL slike:
            </label>
            <Input
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              type="url"
              disabled={!!imageFile}
            />
          </div>

          {/* Existing Image Preview (for editing) */}
          {isEditing && note?.imageUrl && !imageFile && (
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">
                Trenutna slika:
              </label>
              <div className="relative inline-block">
                <img
                  src={note.imageUrl}
                  alt="Trenutna slika"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(note.imageUrl!)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!isPremium && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-blue-700">
              Premium korisnici mogu da dodaju slike u svoje beleške
            </span>
          </div>
        </div>
      )}

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
    </>
  );
};

export default NoteForm;
