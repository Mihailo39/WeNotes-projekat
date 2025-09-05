// src/api/axiosClient.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:4000/api/v1
  withCredentials: true,                 // zbog httpOnly RT cookie
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = localStorage.getItem('access_token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// (opciono) 401 -> pokušaj /auth/refresh JEDNOM, ali NIKAD za sam /auth/refresh poziv
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];
axiosClient.interceptors.response.use(
  r => r,
  async (err: AxiosError) => {
    const original = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = err.response?.status;
    const url = original?.url || '';
    // Ne pokušavaj refresh za auth rute
    if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(err);
    }

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = true;
        try {
          const rr = await axiosClient.get('/auth/refresh');
          const dto = (rr as any).data?.data;
          const newTok = dto?.accessToken ?? null;
          if (newTok) localStorage.setItem('access_token', newTok);
          waiters.forEach(cb => cb(newTok));
          waiters = [];
          if (newTok) {
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newTok}`;
            return axiosClient(original);
          }
        } finally {
          refreshing = false;
        }
      } else {
        const t = await new Promise<string | null>(res => waiters.push(res));
        if (t) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${t}`;
          return axiosClient(original);
        }
      }
      localStorage.removeItem('access_token');
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
