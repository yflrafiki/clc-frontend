import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROUTE_ROLES = {
  '/dashboard':  [1, 2, 3, 4],
  '/members':    [1, 2],
  '/attendance': [2],
  '/tithes':     [3],
  '/welfare':    [3],
  '/offerings':  [1, 3],
  '/accounts':   [1, 3],
  '/reports':    [1, 4],
};

export default function ProtectedRoute({ children, path }) {
  const { user } = useAuth();
  const token = sessionStorage.getItem('token');

  if (!token || !user) return <Navigate to="/" />;

  const allowed = ROUTE_ROLES[path];
  if (allowed && !allowed.includes(user.role_id)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
