import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CivicCoinBadge from '@/components/CivicCoinBadge';
import MobileNavbar from '@/components/MobileNavbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin,
  Bell,
  User,
  LogOut,
} from 'lucide-react';

interface NavigationProps {
  userType?: "citizen" | "government" | null;
  civicCoins?: number;
  notifications?: number;
  onLogout?: () => void;
}

const Navigation = ({ 
  userType, 
  civicCoins = 0, 
  notifications = 0, 
  onLogout 
}: NavigationProps) => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Use auth context data if available, otherwise fall back to props
  const currentUserType = profile?.user_type || userType;
  const currentCivicCoins = profile?.civic_coins || civicCoins;

  return (
    <nav className="bg-background border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Hamburger Menu */}
          <div className="flex items-center space-x-4">
            <MobileNavbar 
              userType={currentUserType}
              civicCoins={currentCivicCoins}
              notifications={notifications}
              onLogout={handleLogout}
            />
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 transition-smooth hover:opacity-80"
            >
              <div className="bg-gradient-primary w-10 h-10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">Civic.io</h1>
                <p className="text-xs text-muted-foreground">Building Better Cities</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && profile && (
              <>
                <Link
                  to={profile.user_type === 'citizen' ? '/citizen-dashboard' : '/government-dashboard'}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive("/citizen-dashboard") || isActive("/government-dashboard") || isActive("/dashboard")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Dashboard
                </Link>
                
                <Link
                  to="/map"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive("/map")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Map
                </Link>

                {profile.user_type === "citizen" && (
                  <>
                    <Link
                      to="/report"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                        isActive("/report")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      Report
                    </Link>
                    <Link
                      to="/leaderboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                        isActive("/leaderboard")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      Leaderboard
                    </Link>
                  </>
                )}
              </>
            )}

            {/* User Actions */}
            {user && profile ? (
              <div className="flex items-center space-x-4">
                {/* Civic Coins */}
                <CivicCoinBadge 
                  coins={profile.civic_coins} 
                  rank={profile.rank as "bronze" | "silver" | "gold" | "platinum"} 
                  showRank={false}
                  size="sm" 
                />

                {/* Notifications */}
                {notifications > 0 && (
                  <div className="relative">
                    <Button variant="ghost" size="sm">
                      <Bell className="w-5 h-5" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
                      >
                        {notifications > 99 ? "99+" : notifications}
                      </Badge>
                    </Button>
                  </div>
                )}

                {/* Profile Actions */}
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <User className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile User Info */}
          <div className="md:hidden flex items-center space-x-2">
            {user && profile && (
              <>
                {notifications > 0 && (
                  <div className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
                    >
                      {notifications > 9 ? "9+" : notifications}
                    </Badge>
                  </div>
                )}
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </>
            )}
            {!user && (
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;