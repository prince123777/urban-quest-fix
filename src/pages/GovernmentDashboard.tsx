import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  Filter,
  Search,
  Calendar,
  FileText,
  Upload,
  Award,
  Bell
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assigned_department?: string;
  government_notes?: string;
  civic_coins_awarded: number;
  reporter_id: string;
  address?: string;
  photo_urls?: string[];
  proof_of_fix_urls?: string[];
  upvotes: number;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Stats {
  total_issues: number;
  pending_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  active_citizens: number;
  avg_resolution_hours: number;
}

const GovernmentDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    if (profile?.user_type === 'government') {
      fetchDashboardData();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('government-dashboard')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'issues' },
          () => fetchDashboardData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch issues with reporter info
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select(`
          *,
          profiles!issues_reporter_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (issuesError) throw issuesError;
      
      // Fetch platform stats
      const { data: statsData, error: statsError } = await supabase
        .from('platform_stats')
        .select('*')
        .single();

      if (statsError) throw statsError;
      
      setIssues((issuesData || []) as Issue[]);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, status: string, notes?: string) => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      if (notes) {
        updates.government_notes = notes;
      }

      if (status === 'in_progress' && !issues.find(i => i.id === issueId)?.assigned_to) {
        updates.assigned_to = profile?.id;
        updates.assigned_department = profile?.department || 'General';
      }

      const { error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId);

      if (error) throw error;

      // Award civic coins when resolving
      if (status === 'resolved') {
        const issue = issues.find(i => i.id === issueId);
        if (issue) {
          const coinAmount = issue.priority === 'urgent' ? 100 : 
                           issue.priority === 'high' ? 75 :
                           issue.priority === 'medium' ? 50 : 25;

          await supabase.rpc('award_civic_coins', {
            user_profile_id: issue.reporter_id,
            coin_amount: coinAmount,
            description_text: `Issue resolved: ${issue.title}`,
            related_issue_id: issueId
          });
        }
      }

      toast({
        title: 'Success',
        description: `Issue status updated to ${status}`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to update issue status',
        variant: 'destructive'
      });
    }
  };

  const assignToDepartment = async (issueId: string, department: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({
          assigned_department: department,
          assigned_to: profile?.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', issueId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Issue assigned to ${department}`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign issue',
        variant: 'destructive'
      });
    }
  };

  // Filter issues based on search and filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || 
                             (issue.assigned_department && issue.assigned_department.includes(departmentFilter));

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to access the government dashboard</h1>
        <Button asChild>
          <a href="/auth">Login</a>
        </Button>
      </div>
    );
  }

  if (profile?.user_type !== 'government') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">This dashboard is only available to government users.</p>
        <Button asChild>
          <a href="/citizen-dashboard">Go to Citizen Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Government Dashboard</h1>
          <p className="text-muted-foreground">
            Manage civic issues and track community engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_issues || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pending_issues || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.in_progress_issues || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolved_issues || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="roads">Roads</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="parks">Parks</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="public-works">Public Works</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="parks-recreation">Parks & Recreation</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="public-safety">Public Safety</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setDepartmentFilter('all');
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle>Issues ({filteredIssues.length})</CardTitle>
            <CardDescription>
              Click on any issue to view details and manage status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Issues Found</h3>
                <p className="text-muted-foreground">No issues match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground">{issue.title}</h4>
                            <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                              {issue.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {issue.profiles?.full_name || 'Anonymous'}
                            </span>
                            {issue.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {issue.address}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(issue.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {issue.upvotes} upvotes
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {issue.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateIssueStatus(issue.id, 'in_progress')}
                              >
                                Start Work
                              </Button>
                              <Select onValueChange={(dept) => assignToDepartment(issue.id, dept)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public-works">Public Works</SelectItem>
                                  <SelectItem value="transportation">Transportation</SelectItem>
                                  <SelectItem value="parks-recreation">Parks & Rec</SelectItem>
                                  <SelectItem value="utilities">Utilities</SelectItem>
                                  <SelectItem value="environmental">Environmental</SelectItem>
                                  <SelectItem value="public-safety">Public Safety</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}
                          
                          {issue.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateIssueStatus(issue.id, 'resolved', 'Issue has been resolved')}
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GovernmentDashboard;