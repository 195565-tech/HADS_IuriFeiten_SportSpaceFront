import  { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Header from '@/react-app/components/Header';

interface Reserva {
  id: number;
  local_id: number;
  data_reserva: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  valor_total: number;
  avaliacao?: number;
  local_nome?: string;
  local_endereco?: string;
  local_esporte?: string;
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReservas();
    }
  }, [user]);

  const fetchReservas = async () => {
    try {
      const response = await api.get('/api/reservas');
      setReservas(response.data);
    } catch (err: any) {
      setError('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      await api.delete(`/api/reservas/${id}`);
      setReservas(reservas.filter(r => r.id !== id));
    } catch (err: any) {
      setError('Erro ao cancelar reserva');
    }
  };

  const avaliarReserva = async (id: number, avaliacao: number) => {
    try {
      await api.post(`/api/reservas/${id}/avaliar`, { avaliacao });
      setReservas(reservas.map(r => 
        r.id === id ? { ...r, avaliacao } : r
      ));
    } catch (err: any) {
      setError('Erro ao avaliar reserva');
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
              Você precisa estar logado para ver suas reservas.
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
          <h1 className="text-3xl font-bold text-gray-900">Minhas Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gerencie suas reservas de espaços esportivos
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
        ) : reservas.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-600">
              Você ainda não fez nenhuma reserva.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {reserva.local_nome || `Local ${reserva.local_id}`}
                    </h3>
                    <p className="text-gray-600">
                      {reserva.local_endereco && `${reserva.local_endereco} • `}
                      {reserva.local_esporte}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Data: {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}</p>
                      <p>Horário: {reserva.hora_inicio} - {reserva.hora_fim}</p>
                      <p>Valor: <span className="text-green-600 font-medium">R$ {Number(reserva.valor_total).toFixed(2)}</span></p>
                      <p>Status: 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          reserva.status === 'ativa' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reserva.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {reserva.status === 'ativa' && (
                      <button
                        onClick={() => cancelarReserva(reserva.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                      >
                        Cancelar
                      </button>
                    )}
                    
                    {!reserva.avaliacao && reserva.status === 'concluida' && (
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => avaliarReserva(reserva.id, star)}
                            className="text-yellow-400 hover:text-yellow-500"
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {reserva.avaliacao && (
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= (reserva.avaliacao ?? 0) ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
