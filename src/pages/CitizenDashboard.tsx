import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CivicCoinBadge from '@/components/CivicCoinBadge';
import {
  Plus,
  MapPin,
  Camera,
  Bell,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Map,
  Menu,
  LogOut,
  User,
  Settings
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  civic_coins_awarded: number;
  address?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface LeaderboardEntry {
  id: string;
  full_name: string;
  civic_coins: number;
  total_reports: number;
  rank: string;
  position: number;
}

const CitizenDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'leaderboard' | 'notifications'>('overview');
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch user's issues
      const { data: issuesData } = await supabase
        .from('issues')
        .select('*')
        .eq('reporter_id', profile.id)
        .order('created_at', { ascending: false });

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(20);

      setMyIssues(issuesData || []);
      setNotifications(notificationsData || []);
      setLeaderboard(leaderboardData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-accent text-accent-foreground';
      case 'acknowledged': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'diamond': return 'text-blue-500';
      case 'platinum': return 'text-gray-400';
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-300';
      default: return 'text-amber-600';
    }
  };

  const filteredIssues = myIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
          <Link to="/auth">
            <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Civic Connect</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Citizen Portal
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <CivicCoinBadge 
              coins={profile.civic_coins} 
              rank={profile.rank as "bronze" | "silver" | "gold" | "platinum"} 
              showRank 
              size="sm" 
            />
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
              {notifications.filter(n => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile.full_name}!
              </h1>
              <p className="text-muted-foreground">
                Ready to make your community better?
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/report">
                <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </Link>
              <Link to="/map">
                <Button variant="outline">
                  <Map className="w-4 h-4 mr-2" />
                  View Map
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-primary text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.total_reports}</div>
              <div className="text-sm opacity-90">Total Reports</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-success text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.resolved_reports}</div>
              <div className="text-sm opacity-90">Resolved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-civic text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.civic_coins}</div>
              <div className="text-sm opacity-90">Civic Coins</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold capitalize text-foreground">{profile.rank}</div>
              <div className="text-sm text-muted-foreground">Current Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">My Issues</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs px-1">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link to="/report">
                    <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                      <Camera className="w-6 h-6" />
                      <span>Report Issue</span>
                    </Button>
                  </Link>
                  <Link to="/map">
                    <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                      <Map className="w-6 h-6" />
                      <span>View Map</span>
                    </Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                      <Award className="w-6 h-6" />
                      <span>Leaderboard</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myIssues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{issue.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {issue.civic_coins_awarded > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-accent">
                            +{issue.civic_coins_awarded}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {myIssues.length === 0 && (
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No issues reported yet</p>
                      <Link to="/report">
                        <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover text-white">
                          Report Your First Issue
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index < 3 ? 'bg-gradient-primary text-white' : 'bg-muted'
                        }`}>
                          <span className="text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{entry.full_name}</p>
                          <p className="text-sm text-muted-foreground">{entry.total_reports} reports</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{entry.civic_coins}</p>
                        <p className={`text-sm capitalize ${getRankColor(entry.rank)}`}>
                          {entry.rank}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{issue.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{issue.category}</Badge>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          {getPriorityIcon(issue.priority)}
                        </div>
                        {issue.address && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            {issue.address}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                        {issue.civic_coins_awarded > 0 && (
                          <div className="flex items-center text-accent font-medium mt-1">
                            <Award className="w-4 h-4 mr-1" />
                            {issue.civic_coins_awarded}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredIssues.length === 0 && (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No issues found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start by reporting your first issue'}
                  </p>
                  <Link to="/report">
                    <Button className="bg-gradient-primary hover:bg-primary-hover text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Report Issue
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Community Leaderboard
                </CardTitle>
                <CardDescription>
                  Top contributors making a difference in the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.id === profile.id ? 'bg-secondary/50 border-2 border-primary' : 'bg-muted/30'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{entry.position}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.full_name}
                            {entry.id === profile.id && (
                              <Badge variant="default" className="ml-2 text-xs">You</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.total_reports} reports
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent">{entry.civic_coins}</p>
                        <p className={`text-sm capitalize font-medium ${getRankColor(entry.rank)}`}>
                          {entry.rank}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated on your civic activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 rounded-lg border transition-colors ${
                        !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground">
                      You'll receive updates when your issues are processed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CitizenDashboard;