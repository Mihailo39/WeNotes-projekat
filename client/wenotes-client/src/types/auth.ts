export interface User {
  id: number;
  username: string;
  role: 'user' | 'premium';
  createdAt: string;
  updatedAt: string;
  email?: string; // opcionalno, ako backend nekad doda
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  confirmPassword: string;
  role?: 'user' | 'premium'; // ⬅ promena
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: User | null; accessToken: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ user: User | null; accessToken: string }>;
  logout: () => Promise<void>; // naš logout je async
  updateUser: (updatedUser: User) => void;
}
