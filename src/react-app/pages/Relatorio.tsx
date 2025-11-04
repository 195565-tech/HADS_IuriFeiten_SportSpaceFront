import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Header from '@/react-app/components/Header';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar localizer com date-fns em português
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Local {
  id: number;
  nome: string;
  user_id?: string;
}

interface Reserva {
  id: number;
  local_id: number;
  local_nome: string;
  data_inicio: string;
  data_fim: string;
  user_id: string;
  nome_usuario?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Reserva;
}

export default function Relatorio() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [localSelecionado, setLocalSelecionado] = useState<number | 'todos'>(
    'todos'
  );
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('agenda');
  const { user } = useAuth();

  useEffect(() => {
    if (user && (user.user_type === 'owner' || user.user_type === 'admin')) {
      fetchLocais();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (locais.length > 0) {
      fetchReservas();
    }
  }, [localSelecionado, locais]);

  const fetchLocais = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user?.user_type === 'admin') {
        response = await api.get('/api/locais');
      } else {
        response = await api.get('/api/locais/meus');
      }
      
      const locaisAprovados = response.data.filter(
        (local: any) => local.status_aprovacao === 'aprovado'
      );
      
      setLocais(locaisAprovados);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar locais');
      console.error('Erro ao buscar locais:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservas = async () => {
    try {
      setLoading(true);
      let url = '/api/reservas';
      
      if (localSelecionado !== 'todos') {
        url += `?local_id=${localSelecionado}`;
      } else if (user?.user_type === 'owner') {
        const locaisIds = locais.map(l => l.id).join(',');
        if (locaisIds) {
          url += `?locais_ids=${locaisIds}`;
        }
      }
      
      const response = await api.get(url);
      setReservas(response.data);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar reservas');
      console.error('Erro ao buscar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const eventos: CalendarEvent[] = reservas.map(reserva => ({
    id: reserva.id,
    title: `${reserva.local_nome} - ${reserva.nome_usuario || 'Usuário'}`,
    start: new Date(reserva.data_inicio),
    end: new Date(reserva.data_fim),
    resource: reserva,
  }));

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Reserva',
    noEventsInRange: 'Não há reservas neste período.',
    showMore: (total: number) => `+ Ver mais (${total})`,
  };

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (!user || (user.user_type !== 'owner' && user.user_type !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso negado
            </h2>
            <p className="text-gray-600">
              Apenas proprietários e administradores podem acessar o dashboard.
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
            Dashboard de Reservas
          </h1>
          <p className="mt-2 text-gray-600">
            Visualize as reservas dos seus locais esportivos
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {locais.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <label
              htmlFor="local-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filtrar por local:
            </label>
            <select
              id="local-filter"
              value={localSelecionado}
              onChange={(e) =>
                setLocalSelecionado(
                  e.target.value === 'todos' ? 'todos' : Number(e.target.value)
                )
              }
              className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos os locais</option>
              {locais.map((local) => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : locais.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum local disponível
            </h3>
            <p className="text-gray-600">
              {user.user_type === 'admin'
                ? 'Não há locais aprovados no sistema.'
                : 'Você ainda não possui locais aprovados para visualizar reservas.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div style={{ height: '700px' }}>
              <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                messages={messages}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                view={view}
                onView={setView}
                defaultView="agenda"
                popup
                culture="pt-BR"
                tooltipAccessor={(event: CalendarEvent) =>
                  `${event.resource.local_nome} - ${
                    event.resource.nome_usuario || 'Usuário'
                  }`
                }
              />
            </div>
          </div>
        )}

        {reservas.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Total de reservas:</strong> {reservas.length}
              {localSelecionado !== 'todos' && (
                <span>
                  {' '}
                  - <strong>Local:</strong>{' '}
                  {locais.find((l) => l.id === localSelecionado)?.nome}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
