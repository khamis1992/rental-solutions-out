
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLocationTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;

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
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            try {
              const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                // Add any other relevant device info
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

              setIsTracking(true);
              setError(null);
            } catch (err) {
              console.error('Error in location tracking:', err);
              setError('Failed to track location');
              toast.error('Location tracking error');
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError(err.message);
            setIsTracking(false);
            toast.error('Location tracking error');
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } catch (err: any) {
        console.error('Error setting up location tracking:', err);
        setError(err.message);
        setIsTracking(false);
        toast.error('Failed to start location tracking');
      }
    };

    startTracking();

    // Cleanup
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { isTracking, error };
};
