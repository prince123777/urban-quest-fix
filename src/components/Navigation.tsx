import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Coins,
  Bell
} from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-background border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-smooth hover:opacity-80"
          >
            <div className="bg-gradient-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Civic Coin</h1>
              <p className="text-xs text-muted-foreground">Building Better Cities</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {userType && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive("/dashboard")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Dashboard
                </Link>
                {userType === "citizen" && (
                  <Link
                    to="/report"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                      isActive("/report")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    Report Issue
                  </Link>
                )}
                <Link
                  to="/map"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive("/map")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  City Map
                </Link>
              </>
            )}

            {/* User Actions */}
            {userType ? (
              <div className="flex items-center space-x-4">
                {/* Civic Coins */}
                <div className="flex items-center space-x-1 bg-gradient-gold px-3 py-1 rounded-full">
                  <Coins className="w-4 h-4 text-accent-foreground" />
                  <span className="text-sm font-semibold text-accent-foreground">
                    {civicCoins.toLocaleString()}
                  </span>
                </div>

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

                {/* Profile Menu */}
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <User className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="civic">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {userType ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-smooth ${
                      isActive("/dashboard")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {userType === "citizen" && (
                    <Link
                      to="/report"
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-smooth ${
                        isActive("/report")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Report Issue
                    </Link>
                  )}
                  <Link
                    to="/map"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-smooth ${
                      isActive("/map")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    City Map
                  </Link>

                  {/* Mobile Civic Coins */}
                  <div className="flex items-center justify-center space-x-1 bg-gradient-gold mx-3 my-2 px-3 py-2 rounded-full">
                    <Coins className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm font-semibold text-accent-foreground">
                      {civicCoins.toLocaleString()} Civic Coins
                    </span>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={onLogout}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="civic" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;