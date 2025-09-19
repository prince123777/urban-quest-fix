import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import CivicCoinBadge from "@/components/CivicCoinBadge";
import {
  MapPin,
  Users,
  ShieldCheck,
  Coins,
  Camera,
  Bell,
  Award,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-civic">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Building Better Cities
            <span className="block text-2xl md:text-3xl font-normal mt-2 text-white/90">
              Together, One Report at a Time
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Report civic issues, earn Civic Coins, and help your government build 
            stronger communities. Every voice matters in creating positive change.
          </p>
          
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Citizen Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-strong hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground">I'm a Citizen</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Report issues and help improve your community
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span className="text-sm">Report issues with photos & location</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-accent" />
                    <span className="text-sm">Earn Civic Coins for valid reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-success" />
                    <span className="text-sm">Get updates when issues are resolved</span>
                  </li>
                </ul>
                <Link to="/register?type=citizen">
                  <Button className="w-full bg-gradient-primary hover:bg-primary-hover text-white group">
                    Start Reporting Issues
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Government Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-strong hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-success rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground">I'm Government Staff</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage and resolve community issues efficiently
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Dashboard with analytics & insights</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-success" />
                    <span className="text-sm">Assign issues to departments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-accent" />
                    <span className="text-sm">Earn coins for resolving issues</span>
                  </li>
                </ul>
                <Link to="/register?type=government">
                  <Button className="w-full bg-gradient-success hover:bg-success text-white group">
                    Access Dashboard
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">2,547</div>
              <div className="text-sm text-white/80">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1,892</div>
              <div className="text-sm text-white/80">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">486</div>
              <div className="text-sm text-white/80">Active Citizens</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24hr</div>
              <div className="text-sm text-white/80">Avg Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How Civic Coin Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Report Issues</h3>
              <p className="text-muted-foreground">
                Spot a pothole, broken streetlight, or garbage? Take a photo, 
                add your location, and submit a report in seconds.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-success rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Government Acts</h3>
              <p className="text-muted-foreground">
                Local government receives your report, assigns it to the right 
                department, and works to resolve the issue quickly.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-gold rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Earn Rewards</h3>
              <p className="text-muted-foreground">
                Get Civic Coins for valid reports and resolved issues. 
                Climb the leaderboard and become a community champion!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Powerful Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader>
                <MapPin className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Smart Location Tracking</CardTitle>
                <CardDescription>
                  Automatic GPS tagging with manual location adjustment for precise issue reporting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader>
                <Bell className="w-8 h-8 text-success mb-2" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant notifications when your reported issues are acknowledged, assigned, and resolved.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader>
                <Award className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Gamification System</CardTitle>
                <CardDescription>
                  Earn Civic Coins, unlock achievements, and compete on leaderboards for community engagement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Verified Government Access</CardTitle>
                <CardDescription>
                  Government employees verify their identity with official ID for secure and trusted issue management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-success mb-2" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive insights on issue trends, response times, and community engagement metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <CardHeader>
                <Users className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Anonymous Reporting</CardTitle>
                <CardDescription>
                  Option to report issues anonymously while still earning Civic Coins for valid submissions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-civic">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens and government employees working together 
            to build better, more responsive communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/register?type=citizen">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                Start as Citizen
              </Button>
            </Link>
            <Link to="/register?type=government">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Government Access
              </Button>
            </Link>
          </div>

          <CivicCoinBadge coins={1250} showRank rank="gold" size="lg" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground text-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-6 h-6" />
                <span className="text-lg font-semibold">Civic Coin</span>
              </div>
              <p className="text-sm text-background/70">
                Empowering citizens and government to build better communities together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Citizens</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/report" className="hover:text-background transition-colors">Report Issues</Link></li>
                <li><Link to="/map" className="hover:text-background transition-colors">View City Map</Link></li>
                <li><Link to="/leaderboard" className="hover:text-background transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Government</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/dashboard" className="hover:text-background transition-colors">Dashboard</Link></li>
                <li><Link to="/analytics" className="hover:text-background transition-colors">Analytics</Link></li>
                <li><Link to="/departments" className="hover:text-background transition-colors">Departments</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/help" className="hover:text-background transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-background transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-sm text-background/70">
              © 2024 Civic Coin. Building better cities, one report at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;