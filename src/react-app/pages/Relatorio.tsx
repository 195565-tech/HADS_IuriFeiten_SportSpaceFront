import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Header from '@/react-app/components/Header';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Função para combinar data e hora
function montarDataHora(dataStr: string, horaStr: string): Date {
  if (!dataStr || !horaStr) {
    console.error('Data ou hora inválida:', dataStr, horaStr);
    return new Date('invalid');
  }
  const [ano, mes, dia] = dataStr.trim().split('-').map(Number);
  const partes = horaStr.trim().split(':').map(Number);
  const date = new Date(ano, mes - 1, dia, partes[0], partes[1], partes[2] || 0);
  
  if (isNaN(date.getTime())) {
    console.error('Date inválido criado:', dataStr, horaStr);
  }
  
  return date;
}

interface Local {
  id: number;
  nome: string;
  user_id?: string;
}

interface Reserva {
  id: number;
  local_id: number;
  local_nome: string;
  data_reserva: string;
  hora_inicio: string;
  hora_fim: string;
  user_id: string;
  nome_usuario?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Reserva | {};
}

export default function Relatorio() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [localSelecionado, setLocalSelecionado] = useState<number | 'todos'>('todos');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('week');
  const { user } = useAuth();

  useEffect(() => {
    if (user && (user.user_type === 'owner' || user.user_type === 'admin')) {
      fetchLocais();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (locais.length > 0) fetchReservas();
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
      console.error(err);
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
        if (locaisIds) url += `?locais_ids=${locaisIds}`;
      }

      const response = await api.get(url);
      setReservas(response.data);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Evento estático de teste
  const eventoTeste: CalendarEvent = {
    id: 999,
    title: "Teste Manual",
    start: new Date(2025, 10, 5, 20, 0), // 5 de novembro de 2025, 20h
    end: new Date(2025, 10, 5, 21, 0),
    resource: {},
  };

  // Montar eventos para o calendário
  const eventosReservas: CalendarEvent[] = reservas.map(reserva => ({
    id: reserva.id,
    title: `${reserva.local_nome} - ${reserva.nome_usuario || 'Usuário'}`,
    start: montarDataHora(reserva.data_reserva, reserva.hora_inicio),
    end: montarDataHora(reserva.data_reserva, reserva.hora_fim),
    resource: reserva,
  }));

  // Adiciona o evento de teste ao início do array
  const eventos = [eventoTeste, ...eventosReservas];

  // LOGS DE DIAGNÓSTICO
  console.log('Reservas recebidas:', reservas);
  console.log('Eventos criados:', eventos);
  eventos.forEach(ev => {
    console.log(
      'Evento:', ev.id,
      'Título:', ev.title,
      'Start:', ev.start, 
      'End:', ev.end,
      'Start válido?', ev.start instanceof Date && !isNaN(ev.start.getTime()),
      'End válido?', ev.end instanceof Date && !isNaN(ev.end.getTime())
    );
  });

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    date: 'Data',
    time: 'Hora',
    event: 'Reserva',
    noEventsInRange: 'Não há reservas neste período.',
    showMore: (total: number) => `+ Ver mais (${total})`,
  };

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: '#3b82f6',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  });

  if (!user || (user.user_type !== 'owner' && user.user_type !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso negado</h2>
            <p className="text-gray-600">Apenas proprietários e administradores podem acessar o dashboard.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Reservas</h1>
          <p className="mt-2 text-gray-600">Visualize as reservas dos seus locais esportivos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {locais.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <label htmlFor="local-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por local:
            </label>
            <select
              id="local-filter"
              value={localSelecionado}
              onChange={e => setLocalSelecionado(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
              className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos os locais</option>
              {locais.map(local => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6" style={{ height: '700px' }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              messages={messages}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              view={view}
              onView={setView}
              defaultView="week"
              popup
              culture="pt-BR"
              tooltipAccessor={event => `${event.title}`}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-6 overflow-auto" style={{ maxHeight: '700px' }}>
            <h2 className="text-xl font-semibold mb-4">Lista de Reservas</h2>
            {reservas.length === 0 ? (
              <p>Nenhuma reserva encontrada.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Local</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservas.map(reserva => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{reserva.local_nome}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reserva.nome_usuario || 'Usuário'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reserva.data_reserva}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reserva.hora_inicio}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reserva.hora_fim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
