import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import CivicLanding from "./pages/CivicLanding";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportIssuePage from "./pages/ReportIssuePage";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MapView from "./pages/MapView";
import NotFound from "./pages/NotFound";
import DashboardRedirect from "./components/DashboardRedirect";

const queryClient = new QueryClient();

// Protected Route Component with Smart Redirection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect based on user type
  if (profile.user_type === 'government') {
    return <Navigate to="/government-dashboard" replace />;
  } else {
    return <Navigate to="/citizen-dashboard" replace />;
  }
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CivicLanding />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      
      {/* Smart Dashboard Route - redirects based on user type */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      } />
      
      {/* Specific Dashboard Routes */}
      <Route path="/citizen-dashboard" element={
        <ProtectedRoute>
          <CitizenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/government-dashboard" element={
        <ProtectedRoute>
          <GovernmentDashboard />
        </ProtectedRoute>
      } />
      
      {/* Other Protected Routes */}
      <Route path="/report" element={
        <ProtectedRoute>
          <ReportIssuePage />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/map" element={<MapView />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
