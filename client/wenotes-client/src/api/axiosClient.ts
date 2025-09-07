// axiosClient - podešeni axios instance sa interceptorima
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { AUTH_ROUTES, API_ENDPOINTS } from '../constants/api';
import { getToken, saveToken, removeToken } from '../utils/authUtils';

const axiosClient = axios.create({
  // Fallback na proxy path kada VITE_API_URL nije postavljen (dev)
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // zbog httpOnly RT cookie
});

// Helper za sigurno setovanje Authorization header-a (radi i sa AxiosHeaders i sa običnim objektom)
function setAuthHeader(
  headers: InternalAxiosRequestConfig['headers'] | undefined,
  token: string
) {
  if (!headers) return { Authorization: `Bearer ${token}` } as any;

  // Axios 1.x može imati AxiosHeaders sa .set metodom
  const maybeAxiosHeaders = headers as any;
  if (typeof maybeAxiosHeaders.set === 'function') {
    maybeAxiosHeaders.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // U suprotnom, merge-ujemo plain objekat
  return { ...headers, Authorization: `Bearer ${token}` };
}

// Mali helper da izvučemo access token iz raznih DTO oblika
function extractAccessToken(dto: any): string | null {
  if (!dto) return null;
  const data = dto.data?.data ?? dto.data ?? dto; // pokrij /data/data i /data i ravan dto
  return (
    data?.accessToken ??
    data?.token ??
    data?.access_token ??
    data?.tokens?.accessToken ??
    data?.tokens?.access ??
    null
  );
}

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers = setAuthHeader(config.headers, token);
  }
  return config;
});

// (opciono) 401 -> pokušaj /auth/refresh JEDNOM, ali NIKAD za sam /auth/refresh/login/register poziv
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];

axiosClient.interceptors.response.use(
  r => r,
  async (err: AxiosError) => {
    const original = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = err.response?.status;
    const url = original?.url || '';

    // Ne pokušavaj refresh za auth rute (izbegava beskonačnu petlju)
    if (AUTH_ROUTES.some(route => url.includes(route))) {
      return Promise.reject(err);
    }

    if (status === 401 && original && !original._retry) {
      original._retry = true;

      // Ako refresh već nije u toku, pokreni ga
        if (!refreshing) {
          refreshing = true;
          try {
            const response = await axiosClient.get(API_ENDPOINTS.AUTH.REFRESH);
            const newToken = extractAccessToken(response.data);

            if (newToken) {
              saveToken(newToken);
              // Probudi sve čekaoce sa novim tokenom
              waiters.forEach(cb => cb(newToken));
              waiters = [];
              
              original.headers = setAuthHeader(original.headers, newToken);
              return axiosClient(original);
            } else {
              // Nema tokena u odgovoru, očisti sve
              removeToken();
              waiters.forEach(cb => cb(null));
              waiters = [];
              return Promise.reject(err);
            }
          } catch (e) {
            // Refresh neuspešan, očisti sve
            removeToken();
            waiters.forEach(cb => cb(null));
            waiters = [];
            return Promise.reject(e);
          } finally {
            refreshing = false;
          }
        }

      // Ako je refresh u toku, čekaj ishod preko waiters queue
      const t = await new Promise<string | null>(res => waiters.push(res));

      if (t) {
        original.headers = setAuthHeader(original.headers, t);
        return axiosClient(original);
      }

      // Ako je refresh propao (t === null), očisti token i baci grešku
      removeToken();
      return Promise.reject(err);
    }

    return Promise.reject(err);
  }
);

export default axiosClient;
