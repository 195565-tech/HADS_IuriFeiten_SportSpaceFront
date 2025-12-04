//define o cabeçalho principal da aplicação, exibindo o nome “SportSpace” e o menu de navegação no topo do site. 
// Ele usa o usuário do contexto de autenticação para decidir quais links mostrar
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold">🏀 SportSpace</span>
          </Link>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {}
                {user?.user_type !== "owner" && (
                  <Link
                    to="/minhas-reservas"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Minhas Reservas
                  </Link>
                )}

                {}
                {(user?.user_type === "admin" || user?.user_type === "owner") && (
                  <Link
                    to="/admin/locais"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Meus Locais
                  </Link>
                )}

                {}
                {(user?.user_type === "admin" || user?.user_type === "owner") && (
                  <Link
                    to="/relatorio"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}

                {}
                {user?.user_type === "admin" && (
                  <Link
                    to="/aprovacao"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Aprovações
                  </Link>
                )}

                <NotificationDropdown />

                <span className="text-gray-300 px-3 py-2 text-sm">
                  Olá, <span className="font-medium">{user.nome}</span>
                </span>

                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
