// components/AuthModal.tsx
import React, { useState } from "react";
import { useAuth } from "../provider/AuthProvider";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { login, register } = useAuth(); // Importa register
  const [isRegisterMode, setIsRegisterMode] = useState(false); // 🚀 NOVO: Estado de modo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegisterMode) {
        // Modo Cadastro
        await register(email, password);
        alert("Cadastro realizado com sucesso! Você já está logado.");
      } else {
        // Modo Login
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || (isRegisterMode ? "Falha no cadastro" : "Falha no login"));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const title = isRegisterMode ? "Cadastrar-se" : "Entrar";
  const buttonText = isRegisterMode ? "Cadastrar" : "Entrar";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-[#20232a]">{title}</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded text-black"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded text-black"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="bg-[#20232a] text-white p-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Processando..." : buttonText}
          </button>
          
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-500 hover:underline"
          >
            Cancelar
          </button>
        </form>
        
        {/* Alternar modo */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError(""); // Limpa o erro ao trocar
                }}
            >
                {isRegisterMode ? "Já tem conta? Faça login" : "Não tem conta? Crie uma"}
            </button>
        </div>
      </div>
    </div>
  );
};