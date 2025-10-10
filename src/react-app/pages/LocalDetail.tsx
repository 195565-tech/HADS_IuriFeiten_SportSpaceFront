import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, DollarSign, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/react-app/components/Header';
import { Local } from '@/shared/types';
const apiUrl = import.meta.env.VITE_API_URL;

export default function LocalDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [local, setLocal] = useState<Local | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const isAdmin = user?.user_type === 'admin';
  const canReserve = user && !isAdmin;

  useEffect(() => {
    if (id) {
      fetchLocal();
    }
  }, [id]);

  const fetchLocal = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/locais/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLocal(data);
      }
    } catch (error) {
      console.error('Erro ao buscar local:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!local) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Local não encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              O local que você está procurando não existe ou foi removido.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar aos locais</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fotos = local.fotos ? JSON.parse(local.fotos) : [];
  const temFotos = fotos.length > 0;
  const fotoAtual = temFotos ? fotos[currentPhotoIndex] : 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar aos locais</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Galeria de Fotos */}
          <div className="relative">
            <div className="aspect-video overflow-hidden">
              <img 
                src={fotoAtual} 
                alt={local.nome}
                className="w-full h-full object-cover"
              />
              {local.esporte && (
                <div className="absolute top-6 left-6">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {local.esporte}
                  </span>
                </div>
              )}
            </div>
            
            {temFotos && fotos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-2">
                  {fotos.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações Principais */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {local.nome}
                </h1>
                
                {local.descricao && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Descrição
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {local.descricao}
                    </p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  {local.endereco && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Endereço</h3>
                        <p className="text-gray-600">{local.endereco}</p>
                      </div>
                    </div>
                  )}
                  
                  {local.telefone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Telefone</h3>
                        <p className="text-gray-600">{local.telefone}</p>
                      </div>
                    </div>
                  )}
                  
                  {local.disponibilidade && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Disponibilidade</h3>
                        <p className="text-gray-600">{local.disponibilidade}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                  {local.valor_hora && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Valor</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {local.valor_hora}
                        <span className="text-sm font-normal text-gray-600">/hora</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {canReserve && (
                      <Link
                        to={`/reservar-local/${local.id}`}
                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Calendar className="w-5 h-5 inline mr-2" />
                        Reservar Agora
                      </Link>
                    )}
                    
                    {local.telefone && (
                      <a
                        href={`tel:${local.telefone}`}
                        className="block w-full bg-gray-600 text-white text-center py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        <Phone className="w-5 h-5 inline mr-2" />
                        Ligar Agora
                      </a>
                    )}
                    
                    {local.telefone && (
                      <a
                        href={`https://wa.me/55${local.telefone.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre o local ${local.nome}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        WhatsApp
                      </a>
                    )}
                    
                    {!user && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 mb-2">
                          Faça login para reservar este local
                        </p>
                      </div>
                    )}
                    
                    {isAdmin && (
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-700">
                          Administradores não podem fazer reservas
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Informações do Local */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Publicado em {new Date(local.created_at!).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
