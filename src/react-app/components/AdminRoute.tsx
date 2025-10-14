import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { JSX } from 'react';

interface AdminRouteProps {
  children: JSX.Element;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();

  if (!user || (user.user_type !== 'admin' && user.user_type !== 'owner')) {
    return <Navigate to="/" />;
  }

  return children;
}