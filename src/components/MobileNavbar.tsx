import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import CivicCoinBadge from '@/components/CivicCoinBadge';
import {
  Menu,
  X,
  Home,
  MapPin,
  FileText,
  Award,
  Coins,
  User,
  Settings,
  LogOut,
  Bell,
  Map
} from 'lucide-react';

interface MobileNavbarProps {
  userType?: "citizen" | "government" | null;
  civicCoins?: number;
  notifications?: number;
  onLogout?: () => void;
}

const MobileNavbar = ({ userType, civicCoins, notifications, onLogout }: MobileNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) onLogout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getMenuItems = () => {
    if (!user || !profile) {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/auth', label: 'Sign In', icon: User },
      ];
    }

    const baseItems = [
      { 
        to: profile.user_type === 'citizen' ? '/citizen-dashboard' : '/government-dashboard', 
        label: 'Dashboard', 
        icon: Home 
      },
      { to: '/map', label: 'Map', icon: Map },
      { to: '/report', label: 'Report Issue', icon: FileText },
    ];

    // Only show leaderboard for citizens
    if (profile.user_type === 'citizen') {
      baseItems.push({ to: '/leaderboard', label: 'Leaderboard', icon: Award });
    }

    return [
      ...baseItems,
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold">Civic.io</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            {user && profile && (
              <div className="pt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{profile.full_name}</p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {profile.user_type}
                    </Badge>
                  </div>
                </div>
                
                {/* Civic Coins */}
                <div className="flex items-center justify-between">
                  <CivicCoinBadge 
                    coins={profile.civic_coins} 
                    rank={profile.rank as "bronze" | "silver" | "gold" | "platinum"} 
                    showRank 
                    size="sm" 
                  />
                  {notifications && notifications > 0 && (
                    <div className="flex items-center space-x-1">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="destructive" className="text-xs">
                        {notifications}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          {user && (
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}

          {/* Guest Actions */}
          {!user && (
            <div className="p-4 border-t space-y-2">
              <Link to="/auth" onClick={handleLinkClick}>
                <Button className="w-full bg-gradient-primary text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={handleLinkClick}>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;