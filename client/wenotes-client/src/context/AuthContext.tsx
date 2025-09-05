import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User, LoginCredentials, RegisterCredentials, AuthContextType } from '../types/auth';
import axiosClient from '../api/axiosClient';
import type { AxiosError } from 'axios';

interface AuthProviderProps { children: ReactNode }
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// helper: normalizuje odgovor
function extractAuth(dto: any): { user: User | null; accessToken: string | null } {
  const data = dto ?? {};
  let user: User | null =
    data.user ??
    data.data?.user ??
    data.profile ??
    null;

  // Ako je DTO ravan (id, username, role, createdAt...) tretiraj ga kao user
  if (!user && typeof data === 'object' && data.id && data.username && data.role) {
    user = {
      id: data.id,
      username: data.username,
      role: data.role,
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    } as User;
  }

  const accessToken =
    data.accessToken ??
    data.token ??
    data.access_token ??
    data.tokens?.accessToken ??
    data.tokens?.access ??
    null;

  return { user, accessToken };
}

const tokenExists = () => Boolean(localStorage.getItem('access_token'));

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // INIT: 1) pokušaj refresh; 2) ako nema RT kolačića, a postoji access_token → /user/users/me
  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const res = await axiosClient.get('/auth/refresh');
        const { user: u, accessToken } = extractAuth(res.data?.data ?? res.data);
        if (accessToken && isMounted) {
          localStorage.setItem('access_token', accessToken);
          setUser(u);
          return;
        }
      } catch {
        // ignore, probamo fallback ispod
      }

      try {
        if (tokenExists() && isMounted) {
          const me = await axiosClient.get('/user/users/me');
          const u = me.data?.data?.user ?? me.data?.data ?? me.data?.user ?? null;
          if (u && isMounted) {
            setUser(u);
            return;
          }
        }
        // nema ni RT ni validnog access tokena
        if (isMounted) {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await axiosClient.post('/auth/login', credentials);
      const { user: u, accessToken } = extractAuth(res.data?.data ?? res.data);
      if (!accessToken) {
        const msg = res.data?.message ?? 'Nevažeći odgovor servera.';
        throw new Error(msg);
      }
      localStorage.setItem('access_token', accessToken);
      setUser(u);
      // redirect posle uspešnog logina
      const redirectTo = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
      return { user: u, accessToken };
    } catch (e) {
      const err = e as AxiosError<any>;
      let serverMsg = 'Greška pri prijavi.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          // Server već šalje srpske poruke, koristimo ih direktno
          serverMsg = errorData.message;
        } else if (errorData.error) {
          serverMsg = errorData.error;
        }
      } else if (err.message) {
        serverMsg = err.message;
      }
      
      throw new Error(serverMsg);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const res = await axiosClient.post('/auth/register', credentials);
      const { user: u, accessToken } = extractAuth(res.data?.data ?? res.data);
      if (!accessToken) {
        const msg = res.data?.message ?? 'Nevažeći odgovor servera.';
        throw new Error(msg);
      }
      localStorage.setItem('access_token', accessToken);
      setUser(u);
      navigate('/dashboard', { replace: true });
      return { user: u, accessToken };
    } catch (e) {
      const err = e as AxiosError<any>;
      let serverMsg = 'Greška pri registraciji.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          if (errorData.message.includes('Username already exists') || errorData.message.includes('username already exists')) {
            serverMsg = 'Korisničko ime već postoji.';
          } else if (errorData.message.includes('Email already exists') || errorData.message.includes('email already exists')) {
            serverMsg = 'Email adresa već postoji.';
          } else {
            serverMsg = errorData.message;
          }
        } else if (errorData.error) {
          serverMsg = errorData.error;
        }
      } else if (err.message) {
        serverMsg = err.message;
      }
      
      throw new Error(serverMsg);
    }
  };

  const logout = async () => {
    try { await axiosClient.post('/auth/logout'); } catch {}
    localStorage.removeItem('access_token');
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

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
