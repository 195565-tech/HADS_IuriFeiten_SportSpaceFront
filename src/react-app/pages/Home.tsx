import { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import Header from '@/react-app/components/Header';
import LocalCard from '@/react-app/components/LocalCard';
import { Local } from '@/shared/types';
import api from '../../services/api';

export default function Home() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('');

  useEffect(() => {
    fetchLocais();
  }, []);

  const fetchLocais = async () => {
    try {
      const response = await api.get('/api/locais');
      setLocais(response.data);
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocais = locais.filter(local => {
    const matchesSearch = local.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (local.endereco && local.endereco.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = !filterSport || local.esporte === filterSport;
    return matchesSearch && matchesSport;
  });

  const uniqueSports = [...new Set(locais.map(local => local.esporte).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Encontre o local perfeito 
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">
                para seu esporte
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Descubra quadras, campos e espaços esportivos próximos a você. 
              Reserve facilmente e pratique seu esporte favorito.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 focus:outline-none text-gray-900"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterSport}
                    onChange={(e) => setFilterSport(e.target.value)}
                    className="pl-10 pr-8 py-3 border-0 focus:outline-none text-gray-900 bg-gray-50 rounded-lg min-w-[150px]"
                  >
                    <option value="">Todos os esportes</option>
                    {uniqueSports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLocais.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterSport ? 'Nenhum local encontrado' : 'Nenhum local cadastrado'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterSport 
                ? 'Tente ajustar seus filtros de busca.' 
                : 'Seja o primeiro a cadastrar um local esportivo!'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Locais Disponíveis
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredLocais.length} {filteredLocais.length === 1 ? 'local' : 'locais'})
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLocais.map(local => (
                <LocalCard key={local.id} local={local} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
