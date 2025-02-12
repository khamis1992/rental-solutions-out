
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationContextType {
  isTracking: boolean;
  error: string | null;
  lastLocation: GeolocationPosition | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_INTERVAL = 30000; // 30 seconds

export function LocationProvider({ children }: { children: ReactNode }) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const startTracking = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser');
        }

        // Request permission
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          throw new Error('Location permission denied');
        }

        // Start watching position
        const id = navigator.geolocation.watchPosition(
          async (position) => {
            if (!mounted) return;

            setLastLocation(position);
            setIsTracking(true);
            setError(null);

            try {
              const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
              };

              const { error: locationError } = await supabase.functions.invoke('track-location', {
                body: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  deviceInfo
                }
              });

              if (locationError) {
                console.error('Error sending location:', locationError);
                toast.error('Failed to update location');
              }
            } catch (err) {
              console.error('Error in location tracking:', err);
              toast.error('Location tracking error');
            }
          },
          (err) => {
            if (!mounted) return;
            console.error('Geolocation error:', err);
            setError(err.message);
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );

        setWatchId(id);
      } catch (err: any) {
        if (!mounted) return;
        console.error('Error setting up location tracking:', err);
        setError(err.message);
        setIsTracking(false);
      }
    };

    startTracking();

    // Cleanup
    return () => {
      mounted = false;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={{ isTracking, error, lastLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
