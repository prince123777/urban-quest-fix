import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import CivicCoinBadge from '@/components/CivicCoinBadge';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Filter,
  TrendingUp,
  Users,
  MapPin,
  Star
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  civic_coins: number;
  total_reports: number;
  resolved_reports: number;
  rank: string;
  user_type: string;
  position: number;
}

const LeaderboardPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'citizen' | 'government'>('all');
  const [sortBy, setSortBy] = useState<'coins' | 'reports'>('coins');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('civic_coins', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setLeaderboard((data || []) as LeaderboardEntry[]);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedLeaderboard = leaderboard
    .filter(entry => {
      const matchesSearch = entry.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || entry.user_type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'coins') {
        return b.civic_coins - a.civic_coins;
      } else {
        return b.total_reports - a.total_reports;
      }
    });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'diamond': return 'text-blue-500 bg-blue-50';
      case 'platinum': return 'text-gray-400 bg-gray-50';
      case 'gold': return 'text-yellow-500 bg-yellow-50';
      case 'silver': return 'text-gray-300 bg-gray-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  const getPositionStyling = (position: number) => {
    if (position <= 3) {
      return `bg-gradient-to-r ${
        position === 1 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
        position === 2 ? 'from-gray-50 to-gray-100 border-gray-200' :
        'from-amber-50 to-amber-100 border-amber-200'
      }`;
    }
    return 'hover:bg-muted/50';
  };

  const currentUserPosition = leaderboard.findIndex(entry => entry.id === profile?.id) + 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Community Leaderboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Top contributors making a difference in our community
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Current User Stats */}
        {user && profile && currentUserPosition > 0 && (
          <Card className="mb-8 bg-gradient-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Ranking</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">#{currentUserPosition}</div>
                      <div className="text-sm opacity-90">Position</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profile.civic_coins}</div>
                      <div className="text-sm opacity-90">Coins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profile.total_reports}</div>
                      <div className="text-sm opacity-90">Reports</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getRankColor(profile.rank)} text-foreground`}>
                    {profile.rank}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{leaderboard.length}</div>
              <div className="text-sm text-muted-foreground">Active Contributors</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {leaderboard.reduce((sum, entry) => sum + entry.civic_coins, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Coins Earned</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {leaderboard.reduce((sum, entry) => sum + entry.total_reports, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Issues Reported</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contributors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contributors</SelectItem>
                  <SelectItem value="citizen">Citizens</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coins">Civic Coins</SelectItem>
                  <SelectItem value="reports">Total Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Rankings ({filteredAndSortedLeaderboard.length})
            </CardTitle>
            <CardDescription>
              Community members ranked by their civic engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAndSortedLeaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'No contributors match your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedLeaderboard.map((entry, index) => {
                  const position = index + 1;
                  const isCurrentUser = entry.id === profile?.id;
                  
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        getPositionStyling(position)
                      } ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Position and Icon */}
                        <div className="flex items-center justify-center w-12 h-12">
                          {position <= 3 ? (
                            getRankIcon(position)
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-muted-foreground">
                                {position}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {entry.full_name}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </h4>
                            <Badge className={`text-xs ${getRankColor(entry.rank)} border-0`}>
                              {entry.rank}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {entry.user_type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{entry.total_reports} reports</span>
                            <span>•</span>
                            <span>{entry.resolved_reports} resolved</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <CivicCoinBadge 
                          coins={entry.civic_coins} 
                          rank={entry.rank as "bronze" | "silver" | "gold" | "platinum"} 
                          showRank={false}
                          size="sm" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;