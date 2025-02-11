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
}

const LocationTracking = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { isTracking, error } = useLocationTracking();
  const [lastLocation, setLastLocation] = useState<LocationRecord | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
        method: 'GET'
      });
      
      if (error) throw error;
      return data.token;
    }
  });

  const { data: locationHistory, isError, error: queryError } = useQuery<LocationRecord[]>({
    queryKey: ["location-history"],
    queryFn: async () => {
      // First verify the view exists by checking for user_locations table
      const { error: tableError } = await supabase
        .from('user_locations')
        .select('id')
        .limit(1);

      if (tableError) {
        throw new Error("Location tracking is not set up properly");
      }

      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          id,
          user_id,
          profiles (
            full_name
          ),
          latitude,
          longitude,
          accuracy,
          device_info,
          connection_status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match LocationRecord interface
      return data.map(record => ({
        ...record,
        full_name: record.profiles?.full_name || null
      })) as LocationRecord[];
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  useEffect(() => {
    if (locationHistory && locationHistory.length > 0) {
      setLastLocation(locationHistory[0]);
    }
  }, [locationHistory]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (isError && queryError) {
      toast.error(`Failed to fetch location data: ${queryError.message}`);
    }
  }, [isError, queryError]);

  useEffect(() => {
    if (!mapContainer.current || !lastLocation || !mapboxToken || map.current) return;

    try {
      // Initialize the map
      mapboxgl.accessToken = mapboxToken;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lastLocation.longitude, lastLocation.latitude],
        zoom: 15
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map to load before updating the ref and state
      newMap.on('load', () => {
        map.current = newMap;
        setMapLoaded(true);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      toast.error('Failed to initialize map');
    }

    return () => {
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [lastLocation, mapboxToken]);

  useEffect(() => {
    if (!mapLoaded || !map.current || !locationHistory) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locationHistory.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'location-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.backgroundColor = '#ff6b6b';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <strong>${location.full_name || 'Unknown User'}</strong>
                <p>Updated ${formatDistanceToNow(new Date(location.created_at), { addSuffix: true })}</p>
              </div>
            `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    // If we have a last location, center the map on it
    if (lastLocation) {
      map.current.flyTo({
        center: [lastLocation.longitude, lastLocation.latitude],
        essential: true
      });
    }
  }, [locationHistory, lastLocation, mapLoaded]);

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
                  <h3 className="font-medium">Current Location</h3>
                  {lastLocation ? (
                    <p className="text-sm text-muted-foreground">
                      Lat: {lastLocation.latitude.toFixed(6)}, 
                      Long: {lastLocation.longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No location data available
                    </p>
                  )}
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
                    {lastLocation ? (
                      <>
                        By: {lastLocation.full_name || 'Unknown User'}
                        <br />
                        {formatDistanceToNow(new Date(lastLocation.created_at), { addSuffix: true })}
                      </>
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
              <h2 className="text-xl font-semibold mb-4">Location History</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationHistory?.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.full_name || 'Unknown'}</TableCell>
                        <TableCell>{location.latitude.toFixed(6)}</TableCell>
                        <TableCell>{location.longitude.toFixed(6)}</TableCell>
                        <TableCell>
                          <Badge variant={location.connection_status === 'active' ? 'success' : 'secondary'}>
                            {location.connection_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(location.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!locationHistory || locationHistory.length === 0) && (
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
