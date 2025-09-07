import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User, LoginCredentials, RegisterCredentials, AuthContextType } from '../types/auth';
import axiosClient from '../api/axiosClient';
import type { AxiosError } from 'axios';
import { extractAuth, tokenExists, saveToken, removeToken } from '../utils/authUtils';
import { extractErrorMessage } from '../utils/errorUtils';
import { API_ENDPOINTS } from '../constants/api';

interface AuthProviderProps { 
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Inicijalizacija: 1) pokušaj refresh; 2) ako nema RT kolačića, a postoji access_token onda /user/users/me
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Prvo pokušaj refresh token
        const res = await axiosClient.get(API_ENDPOINTS.AUTH.REFRESH);
        const { user: u, accessToken } = extractAuth(res.data?.data ?? res.data);
        if (accessToken && isMounted) {
          saveToken(accessToken);
          setUser(u);
          return;
        }
      } catch {
        // ignore, probamo fallback ispod
      }

      try {
        // Fallback: pokušaj sa postojećim access tokenom
        if (tokenExists() && isMounted) {
          const me = await axiosClient.get(API_ENDPOINTS.USER.ME);
          const u = me.data?.data?.user ?? me.data?.data ?? me.data?.user ?? null;
          if (u && isMounted) {
            setUser(u);
            return;
          }
        }
        
        // Nema ni RT ni validnog access tokena
        if (isMounted) {
          removeToken();
          setUser(null);
        }
      } catch {
        if (isMounted) {
          removeToken();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const { user: u, accessToken } = extractAuth(res.data?.data ?? res.data);
      
      if (!accessToken) {
        const msg = res.data?.message ?? 'Nevažeći odgovor servera.';
        throw new Error(msg);
      }
      
      saveToken(accessToken);
      setUser(u);
      
      // Redirect posle uspešnog logina
      const redirectTo = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
      
      return { user: u, accessToken };
    } catch (e) {
      const error = e as AxiosError<any>;
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const res = await axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, credentials);
      const { user: u, accessToken } = extractAuth(res.data?.data ?? res.data);
      
      if (!accessToken) {
        const msg = res.data?.message ?? 'Nevažeći odgovor servera.';
        throw new Error(msg);
      }
      
      saveToken(accessToken);
      setUser(u);
      navigate('/dashboard', { replace: true });
      
      return { user: u, accessToken };
    } catch (e) {
      const error = e as AxiosError<any>;
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try { 
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT); 
    } catch {
      // Ignore logout errors
    }
    
    removeToken();
    setUser(null);
    // Ne pozivamo navigate ovde - ProtectedRoute će automatski preusmeriti
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    // Samo ako imamo user objekat, ne fallback na token
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

