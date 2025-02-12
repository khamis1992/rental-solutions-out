
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationContextType {
  isTracking: boolean;
  error: string | null;
  lastLocation: GeolocationPosition | null;
  permissionStatus: PermissionState | null;
  requestPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_INTERVAL = 30000; // 30 seconds

export function LocationProvider({ children }: { children: ReactNode }) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  const checkPermissionStatus = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);

      // Listen for permission changes
      permission.addEventListener('change', () => {
        setPermissionStatus(permission.state);
        if (permission.state === 'granted') {
          startTracking();
        }
      });
    } catch (err) {
      console.error('Error checking permission:', err);
    }
  };

  const startTracking = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Update user's location tracking consent
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: consentError } = await supabase
          .from('profiles')
          .update({
            location_tracking_enabled: true,
            location_tracking_consent_date: new Date().toISOString()
          })
          .eq('id', user.id);

        if (consentError) {
          console.error('Error updating location consent:', consentError);
        }
      }

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        async (position) => {
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
          console.error('Geolocation error:', err);
          setError(err.message);
          setIsTracking(false);
          
          // Show helpful messages based on error code
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Location access was denied. Please enable location services in your browser settings to continue.');
              break;
            case err.POSITION_UNAVAILABLE:
              setError('Location information is unavailable. Please check your device settings.');
              break;
            case err.TIMEOUT:
              setError('Location request timed out. Please check your internet connection.');
              break;
            default:
              setError('An error occurred while tracking location.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setWatchId(id);
    } catch (err: any) {
      console.error('Error setting up location tracking:', err);
      setError(err.message);
      setIsTracking(false);
    }
  };

  const requestPermission = async () => {
    try {
      // Request a single position to trigger the permission prompt
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      // If we get here, permission was granted
      await startTracking();
    } catch (err: any) {
      console.error('Error requesting permission:', err);
      setError('Location permission was denied. Please enable location services to use this feature.');
      setIsTracking(false);
    }
  };

  useEffect(() => {
    checkPermissionStatus();

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={{ 
      isTracking, 
      error, 
      lastLocation,
      permissionStatus,
      requestPermission
    }}>
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
