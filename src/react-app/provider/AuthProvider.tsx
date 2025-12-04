//Armazena valores globais
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface User {
  user_id: string;
  user_type: 'user' | 'admin' | 'owner';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/me`, {
        method: "GET",
        credentials: "include", 
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user); 
      } else {
        setUser(null); 
      }
    } catch (err) {
      console.error("Erro ao verificar sessão:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha no cadastro. Tente outro email.");
      }

      const data = await res.json();
            console.log('o data', data)

      if (data.token) {
      console.log('gravou login')
      localStorage.setItem('token', data.token);
     }

      setUser(data.user);
    } catch (err: any) {
      console.error("Erro no registro:", err);
      throw new Error(err.message || "Erro desconhecido ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login falhou. Verifique as credenciais.");
    }

    const data = await res.json();
    console.log('retorno no login: ', data)
    if (data.token) {
      console.log('gravou login')
      localStorage.setItem('token', data.token);
    }

    setUser(data.user);
  } catch (err: any) {
    console.error("Erro no login:", err);
    throw new Error(err.message || "Erro desconhecido no login.");
  } finally {
    setLoading(false);
  }
};


const logout = async () => {
  localStorage.removeItem('token');
  setUser(null);
};


  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};