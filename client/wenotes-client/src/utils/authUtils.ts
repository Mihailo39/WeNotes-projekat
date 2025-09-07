import type { User } from '../types/auth';
import { STORAGE_KEYS } from '../constants/api';

/**
 * Normalizuje odgovor sa servera i ekstraktuje user i accessToken
 */
export const extractAuth = (dto: any): { user: User | null; accessToken: string | null } => {
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
};

/**
 * Proverava da li postoji access token u localStorage
 */
export const tokenExists = (): boolean => {
  return Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
};

/**
 * Čuva access token u localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

/**
 * Uklanja access token iz localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Čita access token iz localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Proverava da li je korisnik premium
 */
export const isPremiumUser = (user: User | null): boolean => {
  return user?.role === 'premium';
};

/**
 * Proverava da li je korisnik običan user
 */
export const isRegularUser = (user: User | null): boolean => {
  return user?.role === 'user';
};

/**
 * Formatira datum za prikaz
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
