import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

// Defina a interface para o objeto de usuário (user)
interface User {
  user_id: string;
  user_type: 'user' | 'admin';
  // Adicione outras propriedades do usuário que você usa, como nome ou id
  // id: number; 
}

// Defina a interface para o Contexto de Autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>; // Incluindo o registro
}

// O valor padrão do contexto (usei um valor que reflete o estado inicial)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar o status de autenticação (usada no useEffect)
  const checkAuth = useCallback(async () => {
    try {
      // Usa fetch para /api/me e inclui as credenciais (cookies)
      const res = await fetch(`${apiUrl}/api/me`, {
        method: "GET",
        credentials: "include", 
      });

      if (res.ok) {
        const data = await res.json();
        // Assume que 'data.user' contém o objeto User
        setUser(data.user); 
      } else {
        // Se 401 ou 404, o usuário não está autenticado
        setUser(null); 
      }
    } catch (err) {
      console.error("Erro ao verificar sessão:", err);
      // Mantém o user como null em caso de falha de rede ou CORS
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para checar a autenticação quando o componente é montado
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Função de Registro
  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Importante para receber o cookie de sessão
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha no cadastro. Tente outro email.");
      }

      const data = await res.json();
      setUser(data.user);
      // Não faz mais o 'checkAuth' aqui, pois o servidor já retornou o usuário logado
    } catch (err: any) {
      console.error("Erro no registro:", err);
      throw new Error(err.message || "Erro desconhecido ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  // Função de Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Importante para enviar e receber o cookie
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login falhou. Verifique as credenciais.");
      }

      const data = await res.json();
      setUser(data.user);

    } catch (err: any) {
      console.error("Erro no login:", err);
      throw new Error(err.message || "Erro desconhecido no login.");
    } finally {
      setLoading(false);
    }
  };

  // Função de Logout
  const logout = async () => {
    try {
      // Não precisa de credenciais no body, mas precisa do cookie para o servidor
      // saber qual sessão encerrar
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include", 
      });
      setUser(null);
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      // Mesmo com erro de API, forçamos o logout no cliente
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register, // Exportando a nova função
  };

  // Renderiza os filhos apenas quando a verificação inicial terminar
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar a autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};