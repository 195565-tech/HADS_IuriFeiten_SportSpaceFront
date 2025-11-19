// components/LoginModal.tsx
import React, { useState } from "react";
import { useAuth } from "../provider/AuthProvider";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      setForgotMessage(data.message);
    } catch (err: any) {
      setError("Erro ao solicitar recuperação de senha");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotMessage("");
    setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        {!showForgotPassword ? (
          <>
            <h2 className="text-xl font-bold mb-4">Entrar</h2>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                Esqueci minha senha
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:underline"
              >
                Cancelar
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Recuperar Senha</h2>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            {forgotMessage && (
              <div className="text-green-600 mb-2 text-sm bg-green-50 p-3 rounded">
                {forgotMessage}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="flex flex-col space-y-4">
              <p className="text-sm text-gray-600">
                Digite seu e-mail para receber instruções de recuperação de senha.
              </p>
              <input
                type="email"
                placeholder="E-mail"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={forgotLoading}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotLoading ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                onClick={resetForgotPasswordForm}
                className="text-gray-500 hover:underline"
              >
                Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
