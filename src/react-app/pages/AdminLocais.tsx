import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Header from '@/react-app/components/Header';


interface Local {
  id: number;
  nome: string;
  descricao?: string;
  endereco?: string;
  esporte?: string;
  valor_hora?: number;
  disponibilidade?: string;
  telefone?: string;
  user_id?: string;
  status_aprovacao?: 'pendente' | 'aprovado' | 'reprovado';
  created_at: string;
}


export default function AdminLocais() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();


  useEffect(() => {
    if (user) {
      fetchLocais();
    }
  }, [user]);


  const fetchLocais = async () => {
    try {
      // MODIFICADO: Chamada para endpoint específico que retorna locais do usuário
      const response = await api.get('/api/locais/meus');
      // Não é mais necessário filtrar manualmente, o backend já faz isso
      setLocais(response.data);
    } catch (err: any) {
      setError('Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };


  const deletarLocal = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;


    try {
      await api.delete(`/api/locais/${id}`);
      setLocais(locais.filter(l => l.id !== id));
    } catch (err: any) {
      setError('Erro ao excluir local');
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso negado
            </h2>
            <p className="text-gray-600">
              Você precisa estar logado para gerenciar seus locais.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Locais</h1>
            <p className="mt-2 text-gray-600">
              Gerencie os locais esportivos que você cadastrou
            </p>
          </div>
          <Link
            to="/criar-local"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Cadastrar Novo Local
          </Link>
        </div>


        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}


        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : locais.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum local cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Você ainda não cadastrou nenhum local esportivo.
            </p>
            <Link
              to="/criar-local"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cadastrar Primeiro Local
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locais.map((local) => (
              <div key={local.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {local.nome}
                    </h3>
                    {/* Badge de status */}
                    {local.status_aprovacao === 'pendente' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                        🕐 Aguardando aprovação
                      </span>
                    )}
                    {local.status_aprovacao === 'aprovado' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        ✓ Aprovado
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/editar-local/${local.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deletarLocal(local.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {local.descricao && (
                    <p>{local.descricao}</p>
                  )}
                  {local.endereco && (
                    <p>📍 {local.endereco}</p>
                  )}
                  {local.esporte && (
                    <p>🏃 {local.esporte}</p>
                  )}
                  {local.valor_hora && (
                    <p>💰 R$ {local.valor_hora}/hora</p>
                  )}
                  {local.telefone && (
                    <p>📞 {local.telefone}</p>
                  )}
                  {local.disponibilidade && (
                    <p>⏰ {local.disponibilidade}</p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/local/${local.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
