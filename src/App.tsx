import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Authentication routes - will need Supabase integration */}
          <Route path="/login" element={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Login</h1><p className="text-muted-foreground">Authentication coming soon with Supabase integration</p></div></div>} />
          <Route path="/register" element={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Register</h1><p className="text-muted-foreground">Registration coming soon with Supabase integration</p></div></div>} />
          
          {/* Dashboard routes - will need Supabase integration */}
          <Route path="/dashboard" element={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Dashboard</h1><p className="text-muted-foreground">Dashboard coming soon with Supabase integration</p></div></div>} />
          <Route path="/report" element={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Report Issue</h1><p className="text-muted-foreground">Issue reporting coming soon with Supabase integration</p></div></div>} />
          <Route path="/map" element={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">City Map</h1><p className="text-muted-foreground">Interactive map coming soon</p></div></div>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
