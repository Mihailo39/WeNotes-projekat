import type { AxiosError } from 'axios';
import { HTTP_STATUS } from '../constants/api';

/**
 * Centralizovana funkcija za ekstraktovanje error poruka iz Axios grešaka
 */
export const extractErrorMessage = (error: AxiosError): string => {
  const errorData = error.response?.data as any;
  
  if (errorData?.message) {
    return errorData.message;
  }
  
  if (errorData?.error) {
    return errorData.error;
  }
  
  return error.message || 'Greška na serveru';
};

/**
 * Proverava da li je greška vezana za autentifikaciju
 */
export const isAuthError = (error: AxiosError): boolean => {
  return error.response?.status === HTTP_STATUS.UNAUTHORIZED;
};

/**
 * Proverava da li je greška vezana za validaciju
 */
export const isValidationError = (error: AxiosError): boolean => {
  return error.response?.status === HTTP_STATUS.BAD_REQUEST;
};

/**
 * Proverava da li je greška vezana za dozvolu
 */
export const isForbiddenError = (error: AxiosError): boolean => {
  return error.response?.status === HTTP_STATUS.FORBIDDEN;
};

/**
 * Proverava da li je greška vezana za nepostojanje resursa
 */
export const isNotFoundError = (error: AxiosError): boolean => {
  return error.response?.status === HTTP_STATUS.NOT_FOUND;
};

/**
 * Proverava da li je greška vezana za server
 */
export const isServerError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  return status ? status >= 500 : false;
};

/**
 * Kreira user-friendly error poruku na osnovu tipa greške
 */
export const getFriendlyErrorMessage = (error: AxiosError): string => {
  if (isAuthError(error)) {
    return 'Morate se prijaviti da biste pristupili ovom sadržaju.';
  }
  
  if (isForbiddenError(error)) {
    return 'Nemate dozvolu za ovu akciju.';
  }
  
  if (isNotFoundError(error)) {
    return 'Traženi sadržaj nije pronađen.';
  }
  
  if (isServerError(error)) {
    return 'Došlo je do greške na serveru. Pokušajte ponovo kasnije.';
  }
  
  return extractErrorMessage(error);
};
