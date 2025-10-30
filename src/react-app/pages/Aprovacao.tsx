import { useState, useEffect } from 'react';
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
  status_aprovacao: 'pendente' | 'aprovado' | 'reprovado';
  created_at: string;
}

export default function Aprovacao() {
  const [locaisPendentes, setLocaisPendentes] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.user_type === 'admin') {
      fetchLocaisPendentes();
    } else if (user && user.user_type !== 'admin') {
      setLoading(false);
    }
  }, [user]);

  const fetchLocaisPendentes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/locais/pendentes');
      setLocaisPendentes(response.data);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar locais pendentes');
      console.error('Erro ao buscar pendentes:', err);
    } finally {
      setLoading(false);
    }
  };

  const aprovarLocal = async (id: number) => {
    if (!confirm('Tem certeza que deseja aprovar este local?')) return;

    try {
      setProcessando(id);
      setError('');
      
      await api.patch(`/api/locais/${id}/aprovar`);
      
      // Remove o local da lista após aprovação
      setLocaisPendentes(locaisPendentes.filter(l => l.id !== id));
      
      // Exibe mensagem de sucesso
      alert('Local aprovado com sucesso!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao aprovar local';
      setError(errorMsg);
      console.error('Erro ao aprovar:', err);
    } finally {
      setProcessando(null);
    }
  };

  const reprovarLocal = async (id: number) => {
    if (!confirm('Tem certeza que deseja reprovar este local? Ele será removido permanentemente da base de dados.')) return;

    try {
      setProcessando(id);
      setError('');
      
      await api.delete(`/api/locais/${id}/reprovar`);
      
      // Remove o local da lista após reprovação
      setLocaisPendentes(locaisPendentes.filter(l => l.id !== id));
      
      // Exibe mensagem de sucesso
      alert('Local reprovado e removido da base de dados.');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao reprovar local';
      setError(errorMsg);
      console.error('Erro ao reprovar:', err);
    } finally {
      setProcessando(null);
    }
  };

  // Verifica se o usuário é admin
  if (!user || user.user_type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso negado
            </h2>
            <p className="text-gray-600">
              Apenas administradores podem acessar esta página.
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Aprovação de Locais
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie os locais aguardando aprovação para publicação
          </p>
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
        ) : locaisPendentes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum local pendente
            </h3>
            <p className="text-gray-600">
              Não há locais aguardando aprovação no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6">
              <p className="font-medium">
                {locaisPendentes.length} {locaisPendentes.length === 1 ? 'local aguardando' : 'locais aguardando'} aprovação
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locaisPendentes.map((local) => (
                <div key={local.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Badge de status */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🕐 Pendente
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(local.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Informações do local */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {local.nome}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      {local.descricao && (
                        <p className="line-clamp-2">{local.descricao}</p>
                      )}
                      {local.endereco && (
                        <p className="flex items-start">
                          <span className="mr-2">📍</span>
                          <span>{local.endereco}</span>
                        </p>
                      )}
                      {local.esporte && (
                        <p className="flex items-center">
                          <span className="mr-2">🏃</span>
                          <span>{local.esporte}</span>
                        </p>
                      )}
                      {local.valor_hora && (
                        <p className="flex items-center">
                          <span className="mr-2">💰</span>
                          <span className="font-medium text-gray-900">
                            R$ {local.valor_hora.toFixed(2)}/hora
                          </span>
                        </p>
                      )}
                      {local.telefone && (
                        <p className="flex items-center">
                          <span className="mr-2">📞</span>
                          <span>{local.telefone}</span>
                        </p>
                      )}
                      {local.disponibilidade && (
                        <p className="flex items-center">
                          <span className="mr-2">⏰</span>
                          <span>{local.disponibilidade}</span>
                        </p>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => aprovarLocal(local.id)}
                        disabled={processando === local.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        {processando === local.id ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processando...
                          </span>
                        ) : (
                          '✓ Aprovar'
                        )}
                      </button>
                      
                      <button
                        onClick={() => reprovarLocal(local.id)}
                        disabled={processando === local.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        {processando === local.id ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processando...
                          </span>
                        ) : (
                          '✗ Reprovar'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
