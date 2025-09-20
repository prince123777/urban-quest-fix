import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import CivicCoinBadge from '@/components/CivicCoinBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  Award,
  Bell
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  civic_coins_awarded: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    totalCoins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch recent issues
      const { data: issuesData } = await supabase
        .from('issues')
        .select('*')
        .or(profile.user_type === 'government' 
          ? 'assigned_to.eq.' + profile.id + ',status.neq.resolved'
          : 'reporter_id.eq.' + profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate stats
      const totalIssues = profile.total_reports;
      const resolvedIssues = profile.resolved_reports;
      const pendingIssues = totalIssues - resolvedIssues;

      setRecentIssues(issuesData || []);
      setNotifications(notificationsData || []);
      setStats({
        totalIssues,
        pendingIssues,
        resolvedIssues,
        totalCoins: profile.civic_coins
      });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userType={profile.user_type}
        civicCoins={profile.civic_coins}
        notifications={notifications.filter(n => !n.read).length}
        onLogout={signOut}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile.full_name}!
            </h1>
            <p className="text-muted-foreground">
              {profile.user_type === 'citizen' 
                ? 'Ready to make your community better?' 
                : `Managing issues in ${profile.department || 'your department'}`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <CivicCoinBadge 
              coins={profile.civic_coins} 
              rank={profile.rank as "bronze" | "silver" | "gold" | "platinum"} 
              showRank 
              size="md" 
            />
            {profile.user_type === 'citizen' && (
              <Link to="/report">
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {profile.user_type === 'citizen' ? 'Issues reported' : 'Issues managed'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingIssues}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting resolution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedIssues}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Civic Coins</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoins}</div>
              <p className="text-xs text-muted-foreground">
                Total earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Recent Issues
              </CardTitle>
              <CardDescription>
                {profile.user_type === 'citizen' 
                  ? 'Your recently reported issues' 
                  : 'Issues assigned to you'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentIssues.length > 0 ? (
                <div className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{issue.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          <span className={`text-xs ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                        {issue.civic_coins_awarded > 0 && (
                          <p className="text-xs text-accent font-medium">
                            +{issue.civic_coins_awarded} coins
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No issues yet</p>
                  {profile.user_type === 'citizen' && (
                    <Link to="/report">
                      <Button variant="outline" className="mt-4">
                        Report Your First Issue
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                Stay updated on your civic activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-lg transition-colors ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    You'll receive updates when issues are processed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;