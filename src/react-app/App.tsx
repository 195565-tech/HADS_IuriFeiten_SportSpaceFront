import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "@/react-app/components/LoadingSpinner";
import AdminRoute from "./components/AdminRoute";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import RegisterPage from "@/react-app/pages/Register";
import RecoverPage from "@/react-app/pages/Recover";
import ResetPasswordPage from "@/react-app/pages/ResetPassword"; // ✅ ADICIONAR ESTA LINHA
import DashboardPage from "@/react-app/pages/Dashboard";
import CreateLocalPage from "@/react-app/pages/CreateLocal";
import EditLocalPage from "@/react-app/pages/EditLocal";
import LocalDetailPage from "@/react-app/pages/LocalDetail";
import ReservarLocalPage from "@/react-app/pages/ReservarLocal";
import MinhasReservasPage from "@/react-app/pages/MinhasReservas";
import AdminLocaisPage from "@/react-app/pages/AdminLocais";
import AprovacaoPage from "@/react-app/pages/Aprovacao";
import RelatorioPage from "@/react-app/pages/Relatorio";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recover" element={<RecoverPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* ✅ ADICIONAR ESTA LINHA */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/local/:id" element={<LocalDetailPage />} />
      <Route path="/reservar-local/:id" element={<ReservarLocalPage />} />
      <Route path="/minhas-reservas" element={<MinhasReservasPage />} />
      <Route path="/locais/:id/editar" element={<EditLocalPage />} />

      {/* Rotas protegidas para proprietários e administradores */}
      <Route 
        path="/criar-local" 
        element={
          <AdminRoute>
            <CreateLocalPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/locais" 
        element={
          <AdminRoute>
            <AdminLocaisPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/aprovacao" 
        element={
          <AdminRoute>
            <AprovacaoPage />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/relatorio" 
        element={
          <AdminRoute>
            <RelatorioPage />
          </AdminRoute>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
