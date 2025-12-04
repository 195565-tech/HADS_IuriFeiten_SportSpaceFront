//formulário com dados do espaço esportivo, usuário preenche informações e é direcionado pra página de gerenciamento de locais
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, UploadCloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../components/Header';
import api from '../../services/api';


interface CreateLocal {
    nome: string;
    descricao: string;
    endereco: string;
    esporte: string;
    valor_hora: number | undefined;
    disponibilidade: string;
    telefone: string;
}

interface FotoFile {
    file: File;
    preview: string;
}


export default function CreateLocalPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [fotosArquivos, setFotosArquivos] = useState<FotoFile[]>([]); 
    
    const [formData, setFormData] = useState<CreateLocal>({
        nome: '',
        descricao: '',
        endereco: '',
        esporte: '',
        valor_hora: undefined,
        disponibilidade: '',
        telefone: ''
    });

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
                file: file,
                preview: URL.createObjectURL(file)
            }));
            setFotosArquivos(prev => [...prev, ...newFiles]);
            e.target.value = ''; 
        }
    };

    const removeFotoFile = (index: number) => {
        const fileToRemove = fotosArquivos[index];
        URL.revokeObjectURL(fileToRemove.preview);
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

            if (formData.valor_hora !== undefined) {
                dataToSubmit.append('valorHora', formData.valor_hora.toString());
            }

            fotosArquivos.forEach(fotoObj => {
                dataToSubmit.append('fotos', fotoObj.file); 
            });

            console.log('Dados de Formulário a enviar (FormData, não logável diretamente)');

            const token = localStorage.getItem('token'); 

            const res = await api.post(`/api/locais`, dataToSubmit, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            });
            console.log('Local cadastrado com sucesso!', res);
            navigate('/admin/locais');
        } catch (error: any) {
            console.error('Erro de rede ou ao enviar formulário:', error);
            alert(error.response?.data?.error || 'Erro ao criar local');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 rounded-full p-2 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar ao Painel</span>
                    </button>

                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        🏟️ Cadastrar Novo Local
                    </h1>
                    <p className="text-lg text-gray-600">
                        Preencha todos os detalhes do seu local esportivo para que ele possa ser reservado.
                    </p>
                </div>


                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 transform transition duration-300 hover:shadow-3xl">
                    {}
                    <form onSubmit={handleSubmit} className="space-y-8"> 
                        {}
                        
                        {}
                        <div className="space-y-4">
                            {}
                            <div className="space-y-4">
                                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nome do Local *
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    required
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800"
                                    placeholder="Ex: Quadra Society A - Arena Desportiva"
                                />
                            </div>

                            <div>
                                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    rows={4}
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 resize-none"
                                    placeholder="Descreva as características, facilidades (balneários, estacionamento, etc.), e o que o torna especial."
                                />
                            </div>

                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="endereco" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Endereço
                                    </label>
                                    <input
                                        type="text"
                                        id="endereco"
                                        name="endereco"
                                        value={formData.endereco}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800"
                                        placeholder="Rua, número, bairro, cidade"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Telefone de Contacto
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefone"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800"
                                        placeholder="(+351) 912 345 678"
                                    />
                                </div>
                            </div>


                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="esporte" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Esporte
                                    </label>
                                    <select
                                        id="esporte"
                                        name="esporte"
                                        value={formData.esporte}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl appearance-none bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800"
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

                                <div>
                                    <label htmlFor="valor_hora" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Valor por Hora (R$)
                                    </label>
                                    <input
                                        type="number"
                                        id="valor_hora"
                                        name="valor_hora"
                                        min="0"
                                        max="10000" 
                                        step="0.01"
                                        value={formData.valor_hora || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800"
                                        placeholder="50.00"
                                    />
                                </div>
                            </div>

                            {}
                            <div>
                                <label htmlFor="disponibilidade" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Disponibilidade (Horário de Funcionamento)
                                </label>
                                <input
                                    type="text"
                                    id="disponibilidade"
                                    name="disponibilidade"
                                    value={formData.disponibilidade}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800"
                                    placeholder="Ex: Seg-Sex 8h-22h, Sáb-Dom 8h-18h"
                                />
                            </div>
                        </div>


                        {}
                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">🖼️ Fotos do Local</h2>
                            <p className="text-sm text-gray-600 mb-4">Envie os arquivos de imagem diretamente. Você pode enviar múltiplas fotos.</p>

                            {}
                            <label className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors mb-4">
                                <input
                                    type="file"
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex items-center space-x-3 text-blue-600 font-semibold">
                                    <UploadCloud className="w-6 h-6" />
                                    <span>Clique para selecionar as fotos (máx. 5MB por arquivo)</span>
                                </div>
                            </label>

                            {}
                            {fotosArquivos.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    {fotosArquivos.map((fotoObj, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                            {}
                                            <img
                                                src={fotoObj.preview}
                                                alt={`Preview da Foto ${index + 1}`}
                                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                            />
                                            <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                                                {fotoObj.file.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {(fotoObj.file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFotoFile(index)}
                                                className="p-1 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md"
                                                aria-label={`Remover foto ${index + 1}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {}
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || fotosArquivos.length === 0}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Criando...</span>
                                    </>
                                ) : (
                                    <span>Criar Local</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}