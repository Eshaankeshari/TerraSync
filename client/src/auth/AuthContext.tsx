import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export type User = { id: string; name: string; email: string; role: 'citizen'|'municipal' } | null;

interface AuthContextType {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'citizen'|'municipal') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    login: async (email: string, password: string) => {
      const res = await axios.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    },
    register: async (name: string, email: string, password: string, role: 'citizen'|'municipal' = 'citizen') => {
      const res = await axios.post('/auth/register', { name, email, password, role });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    },
    logout: () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}