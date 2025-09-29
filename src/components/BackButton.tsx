import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
}

const BackButton = ({ 
  to, 
  label, 
  className = "", 
  variant = "ghost" 
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const handleBack = () => {
    if (to) {
      navigate(to);
      return;
    }

    // Smart navigation based on current route and user type
    const currentPath = location.pathname;
    
    // If on a feature page, go back to dashboard
    if (currentPath.includes('/report') || 
        currentPath.includes('/map') || 
        currentPath.includes('/leaderboard') ||
        currentPath.includes('/profile') ||
        currentPath.includes('/settings')) {
      
      if (profile?.user_type === 'government') {
        navigate('/government-dashboard');
      } else {
        navigate('/citizen-dashboard');
      }
      return;
    }

    // If on dashboard, go to home
    if (currentPath.includes('/dashboard')) {
      navigate('/');
      return;
    }

    // Default: go back in browser history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const getDefaultLabel = () => {
    if (label) return label;
    
    const currentPath = location.pathname;
    
    if (currentPath.includes('/report') || 
        currentPath.includes('/map') || 
        currentPath.includes('/leaderboard') ||
        currentPath.includes('/profile') ||
        currentPath.includes('/settings')) {
      return 'Back to Dashboard';
    }
    
    if (currentPath.includes('/dashboard')) {
      return 'Back to Home';
    }
    
    return 'Back';
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`flex items-center space-x-2 ${className}`}
    >
      {to === '/' ? <Home className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
      <span>{getDefaultLabel()}</span>
    </Button>
  );
};

export default BackButton;