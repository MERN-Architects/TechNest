import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate 
        to={requireAdmin ? '/admin/login' : '/login'} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }

  if (!requireAdmin && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;