
import { useEffect, useState } from "react";
import { Vehicle } from "@/types/vehicle";
import { Card } from "@/components/ui/card";
import { MapPin, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VehicleGridProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleGrid = ({ vehicles, onVehicleClick }: VehicleGridProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [locationValue, setLocationValue] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel('vehicle-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'location=neq.null'
        },
        (payload: { new: Vehicle }) => {
          const updatedVehicle = payload.new;
          if (updatedVehicle.location) {
            toast(`${updatedVehicle.make} ${updatedVehicle.model} location updated to ${updatedVehicle.location}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLocationClick = (e: React.MouseEvent, vehicleId: string, currentLocation: string) => {
    e.stopPropagation();
    setEditingLocation(vehicleId);
    setLocationValue(currentLocation || "");
  };

  const handleLocationKeyPress = async (e: React.KeyboardEvent, vehicleId: string) => {
    if (e.key === 'Enter') {
      await handleLocationUpdate(vehicleId);
    } else if (e.key === 'Escape') {
      setEditingLocation(null);
    }
  };

  const handleLocationUpdate = async (vehicleId: string) => {
    if (!locationValue.trim()) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ location: locationValue })
        .eq('id', vehicleId);

      if (error) throw error;

      toast.success("Location updated successfully");
      setEditingLocation(null);
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error("Failed to update location");
    }
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className={cn(
            "flex flex-col h-[220px] sm:h-[240px] cursor-pointer group",
            "hover:shadow-lg transition-all duration-300",
            "bg-card border-border/50 hover:border-border",
            "animate-fade-in"
          )}
          onClick={() => onVehicleClick?.(vehicle.id)}
        >
          <div className="relative w-full h-32 sm:h-36 overflow-hidden rounded-t-lg">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                <Car className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            >
              {vehicle.status}
            </Badge>
          </div>

          <div className="p-3 sm:p-4 flex flex-col flex-grow space-y-2">
            <h3 className="text-base font-medium line-clamp-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-xs text-muted-foreground">
              License Plate: {vehicle.license_plate}
            </p>
            <div 
              className={cn(
                "flex items-center text-xs mt-auto",
                "cursor-pointer hover:bg-muted/50 p-1.5 rounded",
                "transition-colors duration-200"
              )}
              onClick={(e) => handleLocationClick(e, vehicle.id, vehicle.location || "")}
            >
              {editingLocation === vehicle.id ? (
                <Input
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onKeyDown={(e) => handleLocationKeyPress(e, vehicle.id)}
                  onBlur={() => handleLocationUpdate(vehicle.id)}
                  autoFocus
                  className="w-full text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{vehicle.location || "Location not set"}</span>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
