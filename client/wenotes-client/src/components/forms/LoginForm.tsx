import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const next: { [key: string]: string } = {};
    if (!formData.username.trim()) next.username = 'Username is required';
    if (!formData.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData);
      // Navigate će se desiti automatski kroz AuthContext
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {errors.general && (
        <motion.div 
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {errors.general}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username"
            className="bg-[#edffec] border-gray-200 py-3"
            error={errors.username}
            autoComplete="username"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="password"
            className="bg-[#edffec] border-gray-200 py-3"
            error={errors.password}
            autoComplete="current-password"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default LoginForm;
