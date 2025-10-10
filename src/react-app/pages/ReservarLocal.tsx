import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { Local, CreateReserva, ExtendedMochaUser } from '@/shared/types';
import api from '../../services/api';

export default function ReservarLocalPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [local, setLocal] = useState<Local | null>(null);
  const [formData, setFormData] = useState<CreateReserva>({
    local_id: parseInt(id || '0'),
    data_reserva: '',
    hora_inicio: '',
    hora_fim: '',
    observacoes: ''
  });

  const extendedUser = user as unknown as ExtendedMochaUser;
  const isAdmin = extendedUser?.profile?.user_type === 'admin';

  useEffect(() => {
    if (id) {
      fetchLocal();
    }
  }, [id]);

  const fetchLocal = async () => {
    try {
      const response = await api.get(`/api/locais/${id}`);
      const localData: Local = response.data;
      setLocal(localData);
      setFormData(prev => ({ ...prev, local_id: localData.id || 0 }));
    } catch (error) {
      console.error('Erro ao buscar local:', error);
      navigate('/');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSubmit = {
        localId: formData.local_id,
        data: formData.data_reserva,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        status: 'ativa'
      };

      await api.post('/api/reservas', dataToSubmit);
      navigate('/minhas-reservas');
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      alert(error.response?.data?.error || 'Erro ao criar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  // Calcular valor estimado
  const calcularValorEstimado = () => {
    if (!local?.valor_hora || !formData.hora_inicio || !formData.hora_fim) {
      return null;
    }

    const [horaInicio] = formData.hora_inicio.split(':').map(Number);
    const [horaFim] = formData.hora_fim.split(':').map(Number);
    
    if (horaFim <= horaInicio) {
      return null;
    }

    const horas = horaFim - horaInicio;
    return local.valor_hora * horas;
  };

  const valorEstimado = calcularValorEstimado();

  if (loading || loadingLocal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-6">
              Administradores não podem fazer reservas. Apenas usuários padrão podem reservar locais.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Voltar aos Locais
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!local) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/local/${local.id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reservar Local
          </h1>
          <p className="text-gray-600">
            Faça sua reserva para <span className="font-medium">{local.nome}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data da Reserva */}
            <div>
              <label htmlFor="data_reserva" className="block text-sm font-medium text-gray-700 mb-2">
                Data da Reserva *
              </label>
              <input
                type="date"
                id="data_reserva"
                name="data_reserva"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.data_reserva}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hora de Início */}
              <div>
                <label htmlFor="hora_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Início *
                </label>
                <input
                  type="time"
                  id="hora_inicio"
                  name="hora_inicio"
                  required
                  value={formData.hora_inicio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Hora de Fim */}
              <div>
                <label htmlFor="hora_fim" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fim *
                </label>
                <input
                  type="time"
                  id="hora_fim"
                  name="hora_fim"
                  required
                  value={formData.hora_fim}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                value={formData.observacoes}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Informações adicionais sobre sua reserva..."
              />
            </div>

            {/* Resumo da Reserva */}
            {local && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo da Reserva</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Local:</span>
                    <span className="font-medium">{local.nome}</span>
                  </div>
                  
                  {local.esporte && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Esporte:</span>
                      <span className="font-medium">{local.esporte}</span>
                    </div>
                  )}
                  
                  {formData.data_reserva && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">
                        {new Date(formData.data_reserva).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  
                  {formData.hora_inicio && formData.hora_fim && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horário:</span>
                      <span className="font-medium">
                        {formData.hora_inicio} - {formData.hora_fim}
                      </span>
                    </div>
                  )}
                  
                  {valorEstimado !== null && (
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Valor Estimado:</span>
                      <span className="font-bold text-green-600">R$ {valorEstimado.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(`/local/${local.id}`)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
