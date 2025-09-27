import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Loader } from '@googlemaps/js-api-loader';
import {
  MapPin,
  Filter,
  Layers,
  Navigation as NavigationIcon,
  Info,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  photo_urls?: string[];
  upvotes: number;
  civic_coins_awarded: number;
  profiles?: {
    full_name: string;
  };
}

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // User needs to add this

const MapView = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    initializeMap();
    fetchIssues();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('map-issues')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' },
        () => fetchIssues()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && issues.length > 0) {
      updateMapMarkers();
    }
  }, [issues, statusFilter, categoryFilter, priorityFilter]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      // Default to a city center (can be changed based on user location)
      const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstance.current?.setCenter(userLocation);
            mapInstance.current?.setZoom(14);
          },
          (error) => {
            console.log('Location access denied, using default center');
          }
        );
      }

      setMapLoading(false);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: 'Map Error',
        description: 'Failed to load Google Maps. Please check your API key.',
        variant: 'destructive'
      });
      setMapLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          profiles!issues_reporter_id_fkey (
            full_name
          )
        `)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setIssues((data || []) as Issue[]);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast({
        title: 'Error',
        description: 'Failed to load issues',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMapMarkers = () => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Filter issues
    const filteredIssues = issues.filter(issue => {
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      return matchesStatus && matchesCategory && matchesPriority;
    });

    // Create new markers
    filteredIssues.forEach(issue => {
      if (!issue.location_lat || !issue.location_lng) return;

      const markerColor = getMarkerColor(issue.status, issue.priority);
      
      const marker = new google.maps.Marker({
        position: { lat: issue.location_lat, lng: issue.location_lng },
        map: mapInstance.current,
        title: issue.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        setSelectedIssue(issue);
        showInfoWindow(marker, issue);
      });

      markersRef.current.push(marker);
    });
  };

  const getMarkerColor = (status: string, priority: string) => {
    if (status === 'resolved') return '#10b981'; // green
    if (status === 'in_progress') return '#3b82f6'; // blue
    
    // Pending issues colored by priority
    switch (priority) {
      case 'urgent': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'medium': return '#eab308'; // yellow
      case 'low': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const showInfoWindow = (marker: google.maps.Marker, issue: Issue) => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const statusColor = issue.status === 'resolved' ? 'text-green-600' :
                       issue.status === 'in_progress' ? 'text-blue-600' : 'text-yellow-600';

    const priorityColor = issue.priority === 'urgent' ? 'text-red-600' :
                         issue.priority === 'high' ? 'text-orange-600' :
                         issue.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600';

    const content = `
      <div style="max-width: 300px; padding: 8px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${issue.title}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${issue.description || 'No description'}</p>
        
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #666;">
            ${issue.category}
          </span>
          <span class="${statusColor}" style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
            ${issue.status.replace('_', ' ')}
          </span>
          <span class="${priorityColor}" style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
            ${issue.priority}
          </span>
        </div>

        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
          <div>📍 ${issue.address || 'Location not specified'}</div>
          <div>👤 ${issue.profiles?.full_name || 'Anonymous'}</div>
          <div>📅 ${new Date(issue.created_at).toLocaleDateString()}</div>
          <div>👍 ${issue.upvotes} upvotes</div>
          ${issue.civic_coins_awarded > 0 ? `<div>🪙 ${issue.civic_coins_awarded} coins awarded</div>` : ''}
        </div>

        ${issue.photo_urls && issue.photo_urls.length > 0 ? 
          `<img src="${issue.photo_urls[0]}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 4px; margin-top: 8px;" />` : 
          ''
        }
      </div>
    `;

    infoWindowRef.current = new google.maps.InfoWindow({
      content,
      maxWidth: 320
    });

    infoWindowRef.current.open(mapInstance.current, marker);
  };

  const centerMapOnIssue = (issue: Issue) => {
    if (!mapInstance.current || !issue.location_lat || !issue.location_lng) return;
    
    mapInstance.current.setCenter({ 
      lat: issue.location_lat, 
      lng: issue.location_lng 
    });
    mapInstance.current.setZoom(16);
    
    // Find and trigger the marker
    const marker = markersRef.current.find(m => {
      const pos = m.getPosition();
      return pos && 
             Math.abs(pos.lat() - issue.location_lat!) < 0.0001 && 
             Math.abs(pos.lng() - issue.location_lng!) < 0.0001;
    });
    
    if (marker) {
      showInfoWindow(marker, issue);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesStatus && matchesCategory && matchesPriority;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Issue Map</h1>
          <p className="text-muted-foreground">
            View all reported civic issues on an interactive map
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with filters and issue list */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Issue List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Issues ({filteredIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No issues found matching filters
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => centerMapOnIssue(issue)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{issue.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              centerMapOnIssue(issue);
                            }}
                          >
                            <NavigationIcon className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-1 mb-2">
                          <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{issue.address || 'No address'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                {mapLoading ? (
                  <div className="flex flex-col items-center justify-center h-full bg-muted/10 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                    <p className="text-muted-foreground">Loading map...</p>
                    {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' && (
                      <p className="text-red-500 text-sm mt-2">
                        Please configure your Google Maps API key
                      </p>
                    )}
                  </div>
                ) : (
                  <div ref={mapRef} className="w-full h-full rounded-lg" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;