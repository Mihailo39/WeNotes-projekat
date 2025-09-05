import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { userService } from '../api/services/userService';
import type { UpdateUserData } from '../api/services/userService';

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Nova lozinka i potvrda lozinke se ne poklapaju');
      return false;
    }
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Nova lozinka mora imati najmanje 6 karaktera');
      return false;
    }
    
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const updateData: UpdateUserData = {
        username: formData.username !== user?.username ? formData.username : undefined,
        ...(formData.newPassword && { newPassword: formData.newPassword }),
        ...(formData.newPassword && { currentPassword: formData.currentPassword }),
      };
      
      // Proveri da li ima neke promene
      if (!updateData.username && !updateData.newPassword) {
        setError('Nema promena za čuvanje');
        return;
      }
      
      const updatedUser = await userService.updateUser(user!.id, updateData);
      
      // Ažuriraj korisnika u kontekstu
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      setSuccess('Profil je uspešno ažuriran');
      setIsEditing(false);
      
      // Resetuj formu
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
        currentPassword: '',
      }));
      
      // Ako je menjana lozinka, odjavi korisnika
      if (updateData.newPassword) {
        setTimeout(() => {
          logout();
        }, 2000);
      }
      
    } catch (err: any) {
      console.error('Greška pri ažuriranju profila:', err);
      
      // Prijateljske poruke za specifične greške
      if (err.response?.status === 400) {
        if (err.response?.data?.message?.includes('Current password is incorrect')) {
          setError('Trenutna lozinka nije ispravna');
        } else if (err.response?.data?.message?.includes('Username already exists')) {
          setError('Korisničko ime već postoji');
        } else {
          setError(err.response?.data?.message || 'Greška pri ažuriranju profila');
        }
      } else {
        setError(err.message || 'Greška pri ažuriranju profila');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!formData.currentPassword) {
      setDeleteError('Unesite trenutnu lozinku za potvrdu');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setDeleteError(null);
      
      await userService.deleteUser(user!.id, formData.currentPassword);
      
      setSuccess('Nalog je uspešno obrisan');
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (err: any) {
      console.error('Greška pri brisanju naloga:', err);
      
      // Prijateljske poruke za specifične greške
      if (err.response?.status === 401) {
        setDeleteError('Trenutna lozinka nije ispravna');
      } else if (err.response?.status === 400) {
        setDeleteError(err.response?.data?.message || 'Greška pri brisanju naloga');
      } else {
        setDeleteError(err.message || 'Greška pri brisanju naloga');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(prev => ({
      ...prev,
      username: user?.username || '',
      newPassword: '',
      confirmPassword: '',
      currentPassword: '',
    }));
    setError(null);
    setSuccess(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
    }));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#edffec]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Moj Profil</h1>
            <p className="text-gray-600">
              Upravljajte svojim ličnim podacima i nalogom
            </p>
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

          {/* Success Display */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Profile Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informacije o nalogu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Korisničko ime</label>
                <div className="text-gray-900">{user.username}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip naloga</label>
                <div className="text-gray-900">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'premium' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'premium' ? 'Premium' : 'Običan korisnik'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum registracije</label>
                <div className="text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sr-RS') : 'Nepoznato'}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Izmeni profil</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Korisničko ime"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Unesite novo korisničko ime"
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="Trenutna lozinka (potrebna za promene)"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Unesite trenutnu lozinku"
                  />
                </div>
                
                <Input
                  label="Nova lozinka (opciono)"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Unesite novu lozinku"
                />
                
                <Input
                  label="Potvrda nove lozinke"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Potvrdite novu lozinku"
                  disabled={!formData.newPassword}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" isLoading={isSubmitting}>
                  Sačuvaj promene
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Otkaži
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-8">
              <Button onClick={() => setIsEditing(true)}>
                Izmeni profil
              </Button>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-red-900 mb-4">Opasna zona</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-red-900">Obriši nalog</h3>
                  <p className="text-red-700 mt-1">
                    Ova akcija je nepovratna. Svi vaši podaci i beleške će biti trajno obrisani.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Obriši nalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Obriši nalog"
        size="md"
      >
        <div className="space-y-4">
          {/* Error Display */}
          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{deleteError}</span>
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">
                Ova akcija je nepovratna!
              </span>
            </div>
          </div>
          
          <p className="text-gray-700">
            Da li ste sigurni da želite da obrišete svoj nalog? Ova akcija ne može biti poništena.
          </p>
          
          <div>
            <Input
              label="Potvrdite lozinku"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Unesite trenutnu lozinku"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleDeleteAccount}
              isLoading={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              Da, obriši nalog
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
            >
              Otkaži
            </Button>
          </div>
        </div>
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

export default ProfilePage;
