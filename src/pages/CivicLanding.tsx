import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Smartphone,
  Camera,
  Bell,
  Award,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Globe,
  Zap,
  Target,
  TrendingUp,
  Phone
} from "lucide-react";

const CivicLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Civic Connect</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-soft">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Connect Your Community
              <span className="block text-3xl md:text-4xl font-normal mt-2 text-muted-foreground">
                Report Issues • Earn Rewards • Make Change
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Civic Connect empowers citizens and government to work together. 
              Report civic issues with your phone, earn Civic Coins, and track real-time progress.
            </p>
          </div>
          
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Citizen Card */}
            <Card className="border-0 shadow-medium hover:shadow-strong transition-all duration-300 group bg-card/50 backdrop-blur">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground">Citizens</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Report issues and help improve your community
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Mobile OTP Verification</p>
                      <p className="text-sm text-muted-foreground">Secure phone-based authentication</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Report with Media</p>
                      <p className="text-sm text-muted-foreground">Photos, videos, voice descriptions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Earn Civic Coins</p>
                      <p className="text-sm text-muted-foreground">Rewards for valid reports & engagement</p>
                    </div>
                  </div>
                </div>
                <Link to="/register?type=citizen">
                  <Button className="w-full bg-gradient-primary hover:bg-primary-hover text-white group">
                    Join as Citizen
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Government Card */}
            <Card className="border-0 shadow-medium hover:shadow-strong transition-all duration-300 group bg-card/50 backdrop-blur">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-success rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground">Government</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage and resolve community issues efficiently
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">ID Verification</p>
                      <p className="text-sm text-muted-foreground">Upload government ID for secure access</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Analytics Dashboard</p>
                      <p className="text-sm text-muted-foreground">Real-time insights & filtering</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Assign & Track</p>
                      <p className="text-sm text-muted-foreground">Department assignment & status updates</p>
                    </div>
                  </div>
                </div>
                <Link to="/register?type=government">
                  <Button className="w-full bg-gradient-success hover:bg-success text-white group">
                    Government Access
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">2,547</div>
              <div className="text-sm text-muted-foreground">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">1,892</div>
              <div className="text-sm text-muted-foreground">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">486</div>
              <div className="text-sm text-muted-foreground">Active Citizens</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">18hr</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">How Civic Connect Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A simple, secure process that connects citizens directly with government response teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <Badge variant="secondary" className="mb-4">Step 1</Badge>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Report Issues</h3>
              <p className="text-muted-foreground">
                Spot a pothole, broken streetlight, or litter? Take a photo, 
                record your location, and submit instantly with OTP-verified security.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-success rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <Badge variant="secondary" className="mb-4">Step 2</Badge>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Real-time Processing</h3>
              <p className="text-muted-foreground">
                Government teams receive notifications instantly, assign issues to departments, 
                and provide real-time status updates.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-civic rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <Badge variant="secondary" className="mb-4">Step 3</Badge>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Track & Reward</h3>
              <p className="text-muted-foreground">
                Watch progress on the interactive map, earn Civic Coins for valid reports, 
                and climb the community leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-soft">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for effective civic engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Interactive Maps</CardTitle>
                <CardDescription>
                  Google Maps integration with GPS tracking, location tagging, and real-time issue visualization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Real-time Notifications</CardTitle>
                <CardDescription>
                  Instant SMS and email updates when issues are acknowledged, assigned, and resolved.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-civic rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Civic Coins & Leaderboard</CardTitle>
                <CardDescription>
                  Gamification system with rewards for engagement and public leaderboards for top contributors.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Multi-media Reporting</CardTitle>
                <CardDescription>
                  Upload photos, videos, documents, and voice descriptions with automatic transcription.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Mobile OTP verification for citizens and government ID verification for officials.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-civic rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive insights on issue trends, response times, and community engagement metrics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Community?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join thousands of citizens and government teams already making their communities better with Civic Connect.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register?type=citizen">
                <Button size="lg" className="bg-gradient-primary hover:bg-primary-hover text-white px-8 py-4 text-lg">
                  Start as Citizen
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register?type=government">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg">
                  Government Access
                  <Shield className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-muted border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">Civic Connect</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering communities through technology, transparency, and civic engagement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">For Citizens</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/report" className="hover:text-primary transition-colors">Report Issues</Link></li>
                <li><Link to="/map" className="hover:text-primary transition-colors">Interactive Map</Link></li>
                <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                <li><Link to="/rewards" className="hover:text-primary transition-colors">Civic Coins</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">For Government</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
                <li><Link to="/departments" className="hover:text-primary transition-colors">Departments</Link></li>
                <li><Link to="/verification" className="hover:text-primary transition-colors">ID Verification</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Civic Connect. Building stronger communities through civic engagement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CivicLanding;