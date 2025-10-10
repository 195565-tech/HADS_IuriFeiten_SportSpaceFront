import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/', { replace: true });
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        navigate('/', { replace: true });
        return;
      }

      try {
        await exchangeCodeForSessionToken();
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Failed to exchange code for session token:', error);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900">Processando login...</h2>
        <p className="text-gray-600">Aguarde enquanto confirmamos sua autenticação.</p>
      </div>
    </div>
  );
}
