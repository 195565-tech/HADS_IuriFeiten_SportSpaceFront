import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api';

interface Notification {
  id: number;
  tipo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notificacoes');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: Notification) => !n.lida).length);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notificacoes/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, lida: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white rounded-full focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  try {
                    await api.post('/api/notificacoes/read-all');
                    setNotifications(notifications.map(n => ({ ...n, lida: true })));
                    setUnreadCount(0);
                  } catch (error) {
                    console.error('Erro ao marcar todas como lidas:', error);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 ${
                    !notification.lida ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.lida && markAsRead(notification.id)}
                >
                  <p className="text-sm text-gray-900">{notification.mensagem}</p>
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </span>
                    {!notification.lida && (
                      <span className="text-xs text-blue-600">Clique para marcar como lida</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}