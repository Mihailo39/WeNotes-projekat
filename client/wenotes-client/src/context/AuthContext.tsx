import React, { createContext, useContext, useState, useEffect, } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthContextType } from '../types/auth';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded = jwtDecode(token) as any;
        if (decoded.exp * 1000 > Date.now()) {
          // Token je validan, dohvati korisnika
          const response = await axiosClient.get('/auth/me');
          setUser(response.data.user);
        } else {
          localStorage.removeItem('access_token');
        }
      }
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      const { user, accessToken } = response.data;
      
      localStorage.setItem('access_token', accessToken);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Greška pri prijavi');
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await axiosClient.post('/auth/register', credentials);
      const { user, accessToken } = response.data;
      
      localStorage.setItem('access_token', accessToken);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Greška pri registraciji');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
