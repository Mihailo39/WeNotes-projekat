/**
 * API endpoint-ovi za aplikaciju
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  USER: {
    ME: '/user/users/me',
    UPDATE: (id: number) => `/user/users/${id}`,
    DELETE: (id: number) => `/user/users/${id}`
  },
  NOTES: {
    LIST: '/notes',
    CREATE: '/notes',
    GET: (id: number) => `/notes/${id}`,
    UPDATE: (id: number) => `/notes/${id}`,
    DELETE: (id: number) => `/notes/${id}`,
    TOGGLE_PIN: (id: number) => `/notes/${id}/toggle-pin`,
    DUPLICATE: (id: number) => `/notes/${id}/duplicate`,
    SHARE: (id: number) => `/notes/${id}/share`,
    SHARED: (token: string) => `/notes/shared/${token}`
  }
} as const;

/**
 * Rute koje se koriste za autentifikaciju
 */
export const AUTH_ROUTES = [
  '/auth/refresh',
  '/auth/login', 
  '/auth/register'
] as const;

/**
 * Ključevi za localStorage
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token'
} as const;

/**
 * HTTP status kodovi
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;
