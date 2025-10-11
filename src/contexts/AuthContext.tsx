import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  user_id: string;
  nome: string;
  user_type: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/me');
      setUser(response.data.user);
    } catch (error) {
      console.log('Usuário não autenticado');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post('/api/login', { email, senha });
      setUser(response.data.user);
       if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro no login');
    }
  };

  const register = async (nome: string, email: string, senha: string) => {
    try {
      const response = await api.post('/api/register', { nome, email, senha });
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro no cadastro');
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
