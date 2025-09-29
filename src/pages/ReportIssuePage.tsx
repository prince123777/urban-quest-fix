import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/BackButton';
import {
  MapPin,
  Camera,
  Mic,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Map,
  Navigation,
  FileText,
  Volume2
} from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const ReportIssuePage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'details' | 'location' | 'media' | 'review'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState<Location | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (profile.user_type !== 'citizen') {
      navigate('/dashboard');
      return;
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (step === 'location' && mapRef.current && !mapInstance.current) {
      initializeMap();
    }
  }, [step]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      // Initialize Google Maps (you'll need to add your API key)
      const map = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstance.current = map;

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(pos);
            updateLocation(pos);
          },
          () => {
            toast({
              title: "Location access denied",
              description: "Please manually select your location on the map",
              variant: "destructive",
            });
          }
        );
      }

      // Add click listener to map
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          updateLocation({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Unable to load map. Please enter address manually.",
        variant: "destructive",
      });
    }
  };

  const updateLocation = async (coords: { lat: number; lng: number }) => {
    try {
      // Remove existing marker
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
      }

      // Add new marker
      const marker = new google.maps.Marker({
        position: coords,
        map: mapInstance.current,
        title: 'Issue Location',
      });

      markerInstance.current = marker;

      // Reverse geocoding to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setLocation({
            ...coords,
            address: results[0].formatted_address,
          });
        } else {
          setLocation({
            ...coords,
            address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
          });
        }
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (mapInstance.current) {
            mapInstance.current.setCenter(pos);
          }
          updateLocation(pos);
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 photos
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !title.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create issue
      const { data: issue, error } = await supabase
        .from('issues')
        .insert({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          reporter_id: profile.id,
          location_lat: location?.lat,
          location_lng: location?.lng,
          address: location?.address || customAddress,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Upload photos and audio to Supabase Storage
      // TODO: Award civic coins for valid report

      toast({
        title: "Issue Reported Successfully!",
        description: "Thank you for helping improve our community. You've earned 10 Civic Coins!",
      });

      navigate('/citizen-dashboard');
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Unable to submit issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 'details' && (!title.trim() || !category)) {
      toast({
        title: "Missing Information",
        description: "Please enter a title and select a category",
        variant: "destructive",
      });
      return;
    }

    const steps: typeof step[] = ['details', 'location', 'media', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: typeof step[] = ['details', 'location', 'media', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <BackButton />
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Step {['details', 'location', 'media', 'review'].indexOf(step) + 1} of 4</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {['Details', 'Location', 'Media', 'Review'].map((stepName, index) => (
              <div key={stepName} className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ['details', 'location', 'media', 'review'].indexOf(step) >= index
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && <div className={`flex-1 h-1 mx-2 ${
                  ['details', 'location', 'media', 'review'].indexOf(step) > index
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-medium bg-card/50 backdrop-blur">
          {step === 'details' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Issue Details
                </CardTitle>
                <CardDescription>
                  Describe the issue you'd like to report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{title.length}/100</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roads-infrastructure">Roads & Infrastructure</SelectItem>
                      <SelectItem value="waste-management">Waste Management</SelectItem>
                      <SelectItem value="public-safety">Public Safety</SelectItem>
                      <SelectItem value="parks-recreation">Parks & Recreation</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                      <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                      <SelectItem value="high">High - Significant issue</SelectItem>
                      <SelectItem value="urgent">Urgent - Safety hazard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{description.length}/500</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor="anonymous">Report anonymously</Label>
                </div>
              </CardContent>
            </>
          )}

          {step === 'location' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Issue Location
                </CardTitle>
                <CardDescription>
                  Mark the exact location of the issue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Use Current Location
                  </Button>
                </div>

                <div ref={mapRef} className="w-full h-64 rounded-lg border bg-muted" />

                {location && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-medium">Selected Location:</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="custom-address">Or enter address manually</Label>
                  <Input
                    id="custom-address"
                    placeholder="Enter street address"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 'media' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  Add Media
                </CardTitle>
                <CardDescription>
                  Upload photos or record voice description (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Photos (up to 5)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Tap to upload photos
                        </p>
                      </label>
                    </div>
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 w-6 h-6 p-0"
                            onClick={() => removePhoto(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Voice Description</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      className="flex items-center gap-2"
                    >
                      <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    {audioBlob && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="w-4 h-4" />
                        Voice recorded
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 'review' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  Please review your report before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Issue Details</h4>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg space-y-2">
                      <p><strong>Title:</strong> {title}</p>
                      <p><strong>Category:</strong> {category.replace('-', ' ')}</p>
                      <p><strong>Priority:</strong> {priority}</p>
                      {description && <p><strong>Description:</strong> {description}</p>}
                      <p><strong>Anonymous:</strong> {isAnonymous ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {(location || customAddress) && (
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                        <p>{location?.address || customAddress}</p>
                      </div>
                    </div>
                  )}

                  {(photos.length > 0 || audioBlob) && (
                    <div>
                      <h4 className="font-medium">Media</h4>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg space-y-2">
                        {photos.length > 0 && <p>{photos.length} photo(s) attached</p>}
                        {audioBlob && <p>Voice description recorded</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    🪙 You'll earn 10 Civic Coins for this valid report!
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 'details'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {step === 'review' ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-primary hover:bg-primary-hover text-white flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Submit Report
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-primary hover:bg-primary-hover text-white flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportIssuePage;