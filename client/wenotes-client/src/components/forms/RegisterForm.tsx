import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email je obavezan';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email nije validan';
    }

    if (!formData.username) {
      newErrors.username = 'Korisničko ime je obavezno';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Korisničko ime mora imati najmanje 3 karaktera';
    }

    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Lozinka mora imati najmanje 6 karaktera';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potvrda lozinke je obavezna';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne poklapaju';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(formData);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Registrujte se</h2>
          <p className="mt-2 text-gray-600">Kreirajte svoj WeNotes nalog</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="vasa@email.com"
            required
          />

          <Input
            label="Korisničko ime"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="korisnicko_ime"
            required
          />

          <Input
            label="Lozinka"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <Input
            label="Potvrda lozinke"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Registrujte se
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Već imate nalog?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Prijavite se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
