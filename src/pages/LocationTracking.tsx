
import { useEffect, useState, useRef } from "react";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeofenceManager } from "@/components/geofencing/GeofenceManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Time threshold for considering a user inactive (5 minutes)
const INACTIVE_THRESHOLD = 5 * 60 * 1000;

interface LocationRecord {
  id: string;
  user_id: string;
  full_name: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  device_info: any;
  connection_status: string;
  created_at: string;
  updated_at: string;
  last_updated: string;
  profiles?: {
    full_name: string | null;
  }
}

const generateUserColor = (userId: string) => {
  // Generate a consistent color based on user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const LocationTracking = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { isTracking, error } = useLocationTracking();
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    }
  });

  const { data: locations } = useQuery<LocationRecord[]>({
    queryKey: ["user-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000
  });

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('user-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Trigger a refetch when locations change
          queryClient.invalidateQueries({ queryKey: ['user-locations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [51.5074, 25.2867], // Default to Doha coordinates
        zoom: 12
      });

      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      newMap.on('load', () => {
        map.current = newMap;
        setMapLoaded(true);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      toast.error('Failed to initialize map');
    }

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!mapLoaded || !map.current || !locations) return;

    // Track which markers we've updated
    const updatedMarkers = new Set<string>();

    locations.forEach((location) => {
      const userId = location.user_id;
      const isActive = new Date().getTime() - new Date(location.last_updated).getTime() < INACTIVE_THRESHOLD;
      
      if (!isActive) {
        // Remove inactive user markers
        if (markersRef.current[userId]) {
          markersRef.current[userId].remove();
          delete markersRef.current[userId];
        }
        return;
      }

      updatedMarkers.add(userId);
      const userColor = generateUserColor(userId);

      // Create or update marker
      if (!markersRef.current[userId]) {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = userColor;
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div>
                  <strong>${location.profiles?.full_name || 'Unknown User'}</strong>
                  <p>Updated ${formatDistanceToNow(new Date(location.last_updated), { addSuffix: true })}</p>
                  <p>Status: ${location.connection_status}</p>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current[userId] = marker;
      } else {
        // Update existing marker
        markersRef.current[userId]
          .setLngLat([location.longitude, location.latitude])
          .getPopup()
          .setHTML(`
            <div>
              <strong>${location.profiles?.full_name || 'Unknown User'}</strong>
              <p>Updated ${formatDistanceToNow(new Date(location.last_updated), { addSuffix: true })}</p>
              <p>Status: ${location.connection_status}</p>
            </div>
          `);
      }
    });

    // Remove markers for users no longer in the locations data
    Object.keys(markersRef.current).forEach(userId => {
      if (!updatedMarkers.has(userId)) {
        markersRef.current[userId].remove();
        delete markersRef.current[userId];
      }
    });

  }, [locations, mapLoaded]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Location Tracking</h1>
        <Badge 
          variant={isTracking ? "success" : "destructive"}
          className="px-3 py-1"
        >
          {isTracking ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs defaultValue="tracking">
        <TabsList>
          <TabsTrigger value="tracking">Location Tracking</TabsTrigger>
          <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Active Users</h3>
                  <p className="text-sm text-muted-foreground">
                    {locations?.filter(loc => 
                      new Date().getTime() - new Date(loc.last_updated).getTime() < INACTIVE_THRESHOLD
                    ).length || 0} users online
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Last Update</h3>
                  <p className="text-sm text-muted-foreground">
                    {locations?.[0] ? (
                      formatDistanceToNow(new Date(locations[0].last_updated), { addSuffix: true })
                    ) : (
                      'No updates yet'
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="w-full h-[400px] overflow-hidden">
            <div className="w-full h-full" ref={mapContainer}>
              {!mapboxToken && (
                <div className="flex items-center justify-center h-full bg-muted">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Active Users</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations?.filter(loc => 
                      new Date().getTime() - new Date(loc.last_updated).getTime() < INACTIVE_THRESHOLD
                    ).map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: generateUserColor(location.user_id) }}
                            />
                            {location.profiles?.full_name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>{location.latitude.toFixed(6)}</TableCell>
                        <TableCell>{location.longitude.toFixed(6)}</TableCell>
                        <TableCell>
                          <Badge variant={location.connection_status === 'active' ? 'success' : 'secondary'}>
                            {location.connection_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(location.last_updated), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!locations || locations.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No location history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="geofencing">
          <GeofenceManager />
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-sm text-destructive">
            Error: {error}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LocationTracking;
