import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { Local } from '@/shared/types';
import { useAuth } from '../../contexts/AuthContext';

interface LocalCardProps {
  local: Local;
}

export default function LocalCard({ local }: LocalCardProps) {
  const { user } = useAuth();
  const fotos = local.fotos ? JSON.parse(local.fotos) : [];
  const primeiraFoto = fotos[0] || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop';

  return (
    <div className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <Link to={`/local/${local.id}`}>
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={primeiraFoto} 
              alt={local.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {local.esporte && (
              <div className="absolute top-3 left-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {local.esporte}
                </span>
              </div>
            )}
            {local.valor_hora && (
              <div className="absolute top-3 right-3">
                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>R$ {local.valor_hora}/h</span>
                </span>
              </div>
            )}
          </div>
        </Link>
        
        <div className="p-4">
          <Link to={`/local/${local.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {local.nome}
            </h3>
          </Link>
          
          {local.endereco && (
            <p className="text-gray-600 text-sm mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {local.endereco}
            </p>
          )}
          
          {local.descricao && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {local.descricao}
            </p>
          )}

          <div className="flex justify-between items-center">
            <Link
              to={`/local/${local.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver detalhes
            </Link>
            
            {user && user.user_type !== 'admin' && (
              <Link
                to={`/reservar-local/${local.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
