import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Header from '@/react-app/components/Header';
import { Local, UpdateLocal, ExtendedMochaUser } from '@/shared/types';
const apiUrl = import.meta.env.VITE_API_URL;

export default function EditLocalPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [local, setLocal] = useState<Local | null>(null);
  const [fotos, setFotos] = useState<string[]>(['']);
  const [formData, setFormData] = useState<UpdateLocal>({
    nome: '',
    descricao: '',
    endereco: '',
    esporte: '',
    valor_hora: undefined,
    disponibilidade: '',
    telefone: ''
  });

  useEffect(() => {
    if (id && user) {
      fetchLocal();
    }
  }, [id, user]);

  const fetchLocal = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/locais/${id}`);
      if (response.ok) {
        const localData: Local = await response.json();
        setLocal(localData);
        
        // Verificar se o usuário é o dono do local
        if (localData.user_id !== user?.id) {
          navigate('/dashboard');
          return;
        }
        
        setFormData({
          nome: localData.nome,
          descricao: localData.descricao || '',
          endereco: localData.endereco || '',
          esporte: localData.esporte || '',
          valor_hora: localData.valor_hora,
          disponibilidade: localData.disponibilidade || '',
          telefone: localData.telefone || ''
        });
        
        const fotosExistentes = localData.fotos ? JSON.parse(localData.fotos) : [];
        setFotos(fotosExistentes.length > 0 ? fotosExistentes : ['']);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao buscar local:', error);
      navigate('/dashboard');
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor_hora' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleFotoChange = (index: number, value: string) => {
    const newFotos = [...fotos];
    newFotos[index] = value;
    setFotos(newFotos);
  };

  const addFotoField = () => {
    setFotos([...fotos, '']);
  };

  const removeFotoField = (index: number) => {
    if (fotos.length > 1) {
      setFotos(fotos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fotosLimpas = fotos.filter(foto => foto.trim() !== '');
      const dataToSubmit = {
        ...formData,
        fotos: fotosLimpas.length > 0 ? JSON.stringify(fotosLimpas) : undefined
      };

      const response = await fetch(`${apiUrl}/api/locais/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar local');
      }
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
      alert('Erro ao atualizar local');
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loadingLocal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Verificar se o usuário é admin
  const extendedUser = user as ExtendedMochaUser;
  const isAdmin = extendedUser?.profile?.user_type === 'admin';
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-6">
              Apenas administradores podem editar locais.
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
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Local
          </h1>
          <p className="text-gray-600">
            Atualize as informações do seu local esportivo
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Local *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Quadra do Centro Esportivo"
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={3}
                value={formData.descricao}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva seu local, facilidades, equipamentos disponíveis..."
              />
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Esporte */}
              <div>
                <label htmlFor="esporte" className="block text-sm font-medium text-gray-700 mb-2">
                  Esporte
                </label>
                <select
                  id="esporte"
                  name="esporte"
                  value={formData.esporte}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um esporte</option>
                  <option value="Futebol">Futebol</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Basquete">Basquete</option>
                  <option value="Vôlei">Vôlei</option>
                  <option value="Tênis">Tênis</option>
                  <option value="Padel">Padel</option>
                  <option value="Beach Tennis">Beach Tennis</option>
                  <option value="Handebol">Handebol</option>
                  <option value="Squash">Squash</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Valor por Hora */}
              <div>
                <label htmlFor="valor_hora" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor por Hora (R$)
                </label>
                <input
                  type="number"
                  id="valor_hora"
                  name="valor_hora"
                  min="0"
                  step="0.01"
                  value={formData.valor_hora || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Disponibilidade */}
              <div>
                <label htmlFor="disponibilidade" className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidade
                </label>
                <input
                  type="text"
                  id="disponibilidade"
                  name="disponibilidade"
                  value={formData.disponibilidade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Seg-Sex 8h-22h, Sáb-Dom 8h-18h"
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos (URLs)
              </label>
              <div className="space-y-3">
                {fotos.map((foto, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="url"
                      value={foto}
                      onChange={(e) => handleFotoChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                    {fotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFotoField(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFotoField}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar mais uma foto</span>
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
