import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../components/Header';
import api from '../../services/api';

interface UpdateLocal {
  nome: string;
  descricao: string;
  endereco: string;
  esporte: string;
  valor_hora: number | undefined;
  disponibilidade: string;
  telefone: string;
}

interface FotoFile {
  file: File | null;
  preview: string;
}

interface Local {
  id: number;
  user_id: number;
  nome: string;
  descricao: string;
  endereco: string;
  esporte: string;
  valor_hora: number;
  disponibilidade: string;
  telefone: string;
  fotos: string | null;
}

export default function EditLocalPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [localData, setLocalData] = useState<Local | null>(null);
  const [fotosArquivos, setFotosArquivos] = useState<FotoFile[]>([]);

  const [formData, setFormData] = useState<UpdateLocal>({
    nome: '',
    descricao: '',
    endereco: '',
    esporte: '',
    valor_hora: undefined,
    disponibilidade: '',
    telefone: ''
  });

  // Buscar local existente
  useEffect(() => {
    if (!id) return;
    const fetchLocal = async () => {
      try {
        const res = await api.get(`/api/locais/${id}`);
        const data = res.data as Local;
        setLocalData(data);
        setFormData({
          nome: data.nome,
          descricao: data.descricao || '',
          endereco: data.endereco || '',
          esporte: data.esporte || '',
          valor_hora: data.valor_hora,
          disponibilidade: data.disponibilidade || '',
          telefone: data.telefone || ''
        });

        if (data.fotos) {
          const urls = JSON.parse(data.fotos) as string[];
          setFotosArquivos(urls.map(url => ({ file: null, preview: url })));
        }
      } catch (err) {
        console.error('Erro ao carregar local:', err);
        navigate('/dashboard');
      }
    };
    fetchLocal();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor_hora' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: FotoFile[] = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFotosArquivos(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const removeFotoFile = (index: number) => {
    const fileToRemove = fotosArquivos[index];
    if (fileToRemove.file) URL.revokeObjectURL(fileToRemove.preview);
    setFotosArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('nome', formData.nome);
      dataToSubmit.append('descricao', formData.descricao);
      dataToSubmit.append('endereco', formData.endereco);
      dataToSubmit.append('esporte', formData.esporte);
      dataToSubmit.append('disponibilidade', formData.disponibilidade);
      dataToSubmit.append('telefone', formData.telefone);
      if (formData.valor_hora !== undefined)
        dataToSubmit.append('valorHora', formData.valor_hora.toString());

      // URLs antigas (mantidas)
      const existingUrls = fotosArquivos
        .filter(f => !f.file)
        .map(f => f.preview);
      dataToSubmit.append('fotosExistentes', JSON.stringify(existingUrls));

      // Novos arquivos
      fotosArquivos.forEach(foto => {
        if (foto.file) {
          dataToSubmit.append('fotos', foto.file);
        }
      });

      const token = localStorage.getItem('token');
      await api.put(`/api/locais/${id}`, dataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Local atualizado com sucesso!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro ao atualizar local:', err);
      alert(err.response?.data?.error || 'Erro ao atualizar local.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !localData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (String(localData.user_id) !== String(user.user_id)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para editar este local.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Local</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Local *
            </label>
            <input
              id="nome"
              name="nome"
              required
              value={formData.nome}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              value={formData.descricao}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endereco" className="block text-sm font-semibold text-gray-700 mb-2">
              Endereço
            </label>
            <input
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="esporte" className="block text-sm font-semibold text-gray-700 mb-2">
                Esporte
              </label>
              <select
                id="esporte"
                name="esporte"
                value={formData.esporte}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione...</option>
                <option value="Futebol">Futebol</option>
                <option value="Vôlei">Vôlei</option>
                <option value="Tênis">Tênis</option>
                <option value="Beach Tennis">Beach Tennis</option>
                <option value="Padel">Padel</option>
              </select>
            </div>

            <div>
              <label htmlFor="valor_hora" className="block text-sm font-semibold text-gray-700 mb-2">
                Valor por Hora (R$)
              </label>
              <input
                id="valor_hora"
                name="valor_hora"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_hora || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Upload de fotos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fotos</label>
            <div className="space-y-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fotos-input"
              />
              <label
                htmlFor="fotos-input"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
              >
                <UploadCloud className="w-5 h-5" />
                Adicionar Fotos
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {fotosArquivos.map((foto, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={foto.preview}
                      alt={`Foto ${i + 1}`}
                      className="rounded-lg w-full h-32 object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFotoFile(i)}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
