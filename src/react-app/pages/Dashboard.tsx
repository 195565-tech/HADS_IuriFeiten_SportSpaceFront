import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Clock, X } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { Local, Reserva } from '@/shared/types';
import api from '@/services/api';
const apiUrl = import.meta.env.VITE_API_URL;

// Garantindo que id de Reserva nunca seja undefined
interface ReservaComId extends Reserva {
  id: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [locais, setLocais] = useState<Local[]>([]);
  const [reservas, setReservas] = useState<ReservaComId[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.user_type === 'user' ||  user?.user_type === 'owner' || false;

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        fetchMeusLocais();
      } else {
        fetchMinhasReservas();
      }
    }
  }, [user, isAdmin]);

  const fetchMeusLocais = async () => {
   
    try {
      const response = await api.get('/api/locais');
      if (response) {
        const meusLocais = response.data.filter((local: Local) => 
        local.user_id === user?.user_id
      );
      setLocais(meusLocais);

      }
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMinhasReservas = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/minhas-reservas`);
      if (response.ok) {
        const data: Reserva[] = await response.json();
        // Filtrando apenas reservas que possuem id definido
        const reservasComId = data.filter((r): r is ReservaComId => r.id !== undefined);
        setReservas(reservasComId);
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/reservas/${id}/cancelar`, {
        method: 'PUT',
      });

      if (response.ok) {
        setReservas(reservas.map(r => r.id === id ? { ...r, status: 'cancelada' } : r));
      } else {
        alert('Erro ao cancelar reserva');
      }
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      alert('Erro ao cancelar reserva');
    }
  };

  const handleDeleteLocal = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/locais/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLocais(locais.filter(local => local.id !== id));
      } else {
        alert('Erro ao excluir local');
      }
    } catch (error) {
      console.error('Erro ao excluir local:', error);
      alert('Erro ao excluir local');
    }
  };

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isAdmin ? 'Meus Locais' : 'Minhas Reservas'}
              </h1>
              <p className="text-gray-600">
                {isAdmin
                  ? 'Gerencie seus locais esportivos cadastrados'
                  : 'Acompanhe suas reservas de locais esportivos'}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <Link
              to="/criar-local"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Local</span>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isAdmin ? (
          locais.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Nenhum local cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece cadastrando seu primeiro local esportivo.
              </p>
              <Link
                to="/criar-local"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Cadastrar Primeiro Local</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {locais.map(local => {
                const fotos = local.fotos ? JSON.parse(local.fotos) : [];
                const primeiraFoto =
                  fotos[0] || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop';

                return (
                  <div key={local.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={primeiraFoto} alt={local.nome} className="w-full h-full object-cover" />
                      {local.esporte && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {local.esporte}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{local.nome}</h3>

                      {local.endereco && (
                        <p className="text-gray-600 text-sm mb-4 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {local.endereco}
                        </p>
                      )}

                      {local.valor_hora && <p className="text-green-600 font-medium mb-4">R$ {local.valor_hora}/hora</p>}

                      <div className="flex space-x-2">
                        <Link
                          to={`/local/${local.id}`}
                          className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </Link>

                        <Link
                          to={`/editar-local/${local.id}`}
                          className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>

                        <button
                          onClick={() => local.id !== undefined && handleDeleteLocal(local.id)}
                          className="flex items-center justify-center bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                          title="Excluir local"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : reservas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-gray-600 mb-6">Explore nossos locais esportivos e faça sua primeira reserva.</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Calendar className="w-5 h-5" />
              <span>Explorar Locais</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservas.map(reserva => (
              <div key={reserva.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{reserva.local_nome}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reserva.status === 'ativa'
                            ? 'bg-green-100 text-green-800'
                            : reserva.status === 'cancelada'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reserva.status === 'ativa'
                          ? 'Ativa'
                          : reserva.status === 'cancelada'
                          ? 'Cancelada'
                          : 'Concluída'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {reserva.hora_inicio} - {reserva.hora_fim}
                        </span>
                      </div>
                      {reserva.valor_total && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-medium">R$ {reserva.valor_total}</span>
                        </div>
                      )}
                    </div>

                    {reserva.local_endereco && (
                      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{reserva.local_endereco}</span>
                      </div>
                    )}

                    {reserva.observacoes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Observações:</span> {reserva.observacoes}
                        </p>
                      </div>
                    )}
                  </div>

                  {reserva.status === 'ativa' && reserva.id !== undefined && (
                    <button
                      onClick={() => handleCancelarReserva(reserva.id)}
                      className="flex items-center justify-center bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors ml-4"
                      title="Cancelar reserva"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
