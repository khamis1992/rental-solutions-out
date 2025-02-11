
import { useEffect } from "react";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Activity } from "lucide-react";
import { toast } from "sonner";

const LocationTracking = () => {
  const { isTracking, error } = useLocationTracking();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium">Tracking Status</h3>
              <p className="text-sm text-muted-foreground">
                {isTracking 
                  ? "Currently tracking vehicle location" 
                  : error 
                    ? "Unable to track location" 
                    : "Initializing tracking..."
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium">Location Updates</h3>
              <p className="text-sm text-muted-foreground">
                {isTracking 
                  ? "Receiving real-time location updates" 
                  : "Location updates paused"
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-sm text-destructive">
            Error: {error}
          </div>
        </Card>
      )}

      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4">About Location Tracking</h2>
        <p className="text-muted-foreground">
          This feature enables real-time tracking of vehicle locations for enhanced fleet management and security. 
          Location data is collected securely and used only for authorized fleet management purposes.
        </p>
      </div>
    </div>
  );
};

export default LocationTracking;
