import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLoader } from 'react-icons/fi';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiLoader className="spinner-icon" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
