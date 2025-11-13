import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Header from '@/react-app/components/Header';


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


type SortConfig = {
  key: keyof Reserva;
  direction: 'asc' | 'desc';
} | null;


type FilterConfig = {
  local_nome: string;
  nome_usuario: string;
  data_reserva: string;
  hora_inicio: string;
  hora_fim: string;
};


export default function Relatorio() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<FilterConfig>({
    local_nome: '',
    nome_usuario: '',
    data_reserva: '',
    hora_inicio: '',
    hora_fim: '',
  });
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
  }, [locais]);


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


      if (user?.user_type === 'owner') {
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


  // Formatar data para DD/MM/YYYY
  const formatarData = (dataStr: string): string => {
    if (!dataStr) return '';
    
    // Se a data já estiver no formato esperado (YYYY-MM-DD)
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }
    
    return dataStr;
  };


  // Função de ordenação
  const handleSort = (key: keyof Reserva) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  // Função de filtro
  const handleFilterChange = (key: keyof FilterConfig, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };


  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      local_nome: '',
      nome_usuario: '',
      data_reserva: '',
      hora_inicio: '',
      hora_fim: '',
    });
  };


  // Aplicar filtros e ordenação
  const filteredAndSortedReservas = useMemo(() => {
    let filtered = [...reservas];


    // Aplicar filtros
    Object.keys(filters).forEach((key) => {
      const filterKey = key as keyof FilterConfig;
      const filterValue = filters[filterKey].toLowerCase();
      if (filterValue) {
        filtered = filtered.filter(reserva => {
          let value = reserva[filterKey as keyof Reserva];
          
          // Para data, formatar antes de filtrar
          if (filterKey === 'data_reserva' && value) {
            value = formatarData(value.toString()) as any;
          }
          
          return value?.toString().toLowerCase().includes(filterValue);
        });
      }
    });


    // Aplicar ordenação
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }


    return filtered;
  }, [reservas, filters, sortConfig]);


  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Local', 'Usuário', 'Data', 'Hora Início', 'Hora Fim'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedReservas.map(reserva =>
        [
          `"${reserva.local_nome}"`,
          `"${reserva.nome_usuario || 'Usuário não identificado'}"`,
          formatarData(reserva.data_reserva),
          reserva.hora_inicio,
          reserva.hora_fim,
        ].join(',')
      ),
    ].join('\n');


    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `relatorio_reservas_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // Ícone de ordenação
  const SortIcon = ({ columnKey }: { columnKey: keyof Reserva }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };


  if (!user || (user.user_type !== 'owner' && user.user_type !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso negado</h2>
            <p className="text-gray-600">Apenas proprietários e administradores podem acessar o relatório.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Relatório de Reservas</h1>
          <p className="mt-2 text-gray-600">Visualize e filtre as reservas dos seus locais esportivos</p>
        </div>


        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">{error}</div>
        )}


        {/* Barra de controles */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredAndSortedReservas.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Exportar CSV
            </button>
          </div>
        </div>


        {/* Tabela com filtros */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('local_nome')}>
                      Local <SortIcon columnKey="local_nome" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('nome_usuario')}>
                      Usuário <SortIcon columnKey="nome_usuario" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('data_reserva')}>
                      Data <SortIcon columnKey="data_reserva" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('hora_inicio')}>
                      Início <SortIcon columnKey="hora_inicio" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('hora_fim')}>
                      Fim <SortIcon columnKey="hora_fim" />
                    </div>
                  </th>
                </tr>
                {/* Linha de filtros */}
                <tr className="bg-gray-100">
                  <th className="px-6 py-2">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={filters.local_nome}
                      onChange={e => handleFilterChange('local_nome', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-2">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={filters.nome_usuario}
                      onChange={e => handleFilterChange('nome_usuario', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-2">
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={filters.data_reserva}
                      onChange={e => handleFilterChange('data_reserva', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-2">
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={filters.hora_inicio}
                      onChange={e => handleFilterChange('hora_inicio', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-2">
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={filters.hora_fim}
                      onChange={e => handleFilterChange('hora_fim', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Carregando...
                    </td>
                  </tr>
                ) : filteredAndSortedReservas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedReservas.map(reserva => (
                    <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.local_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.nome_usuario || 'Usuário não identificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(reserva.data_reserva)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.hora_inicio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.hora_fim}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
