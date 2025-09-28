import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardRedirect = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (profile) {
        // Redirect based on user type
        if (profile.user_type === 'government') {
          navigate('/government-dashboard', { replace: true });
        } else {
          navigate('/citizen-dashboard', { replace: true });
        }
      } else {
        // If no profile exists yet, wait a moment for it to be created
        const timeout = setTimeout(() => {
          navigate('/citizen-dashboard', { replace: true });
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    } else if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default DashboardRedirect;