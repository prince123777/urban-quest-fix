// Update this page (the content is just a fallback if you fail to update the page)
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-civic bg-clip-text text-transparent">
            Welcome to Civic Coin
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            This page redirects to the landing page. The main experience is on the home page.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>🏗️ <strong>Note:</strong> Authentication, database features, and backend functionality require Supabase integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
