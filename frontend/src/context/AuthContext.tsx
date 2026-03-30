import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../api/client';

type Role = 'viewer' | 'analyst' | 'admin';

interface AuthUser {
  id: number;
  email: string;
  role: Role;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('access_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate stored token by fetching /auth/me
  useEffect(() => {
    const validate = async () => {
      if (!token) { setIsLoading(false); return; }
      try {
        const { data } = await axios.get('/auth/me');
        setUser(data);
      } catch {
        // Token expired or invalid — clear everything
        localStorage.removeItem('access_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    validate();
  }, [token]);

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams({ username: email, password });
    const { data } = await axios.post('/auth/login', params);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setToken(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);