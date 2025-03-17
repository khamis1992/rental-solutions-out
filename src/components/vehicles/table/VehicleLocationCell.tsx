
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateVehicleLocation } from "@/services/vehicle-service";
import { retryOperation } from "@/components/agreements/utils/retryUtils";

export interface VehicleLocationCellProps {
  vehicleId: string;
  isEditing: boolean;
  location: string;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export const VehicleLocationCell = ({
  vehicleId,
  isEditing,
  location,
  onEditStart,
  onEditEnd
}: VehicleLocationCellProps) => {
  const [value, setValue] = useState(location);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Setup query for refetching vehicle data
  const { refetch } = useQuery({
    queryKey: ["vehicles"],
    enabled: false, // Don't run on mount
  });

  // Reset the value when location prop changes
  useEffect(() => {
    setValue(location);
    setErrorMessage(null);
  }, [location]);

  const handleSave = async () => {
    if (value === location) {
      // No changes made, just close the editor
      onEditEnd();
      return;
    }

    if (!value.trim()) {
      setErrorMessage("Location cannot be empty");
      return;
    }
    
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      console.log("Updating location for vehicle:", vehicleId);
      console.log("Current location:", location);
      console.log("New location:", value);
      
      // Use the dedicated service function
      const updatedVehicle = await updateVehicleLocation(vehicleId, value);
      
      if (!updatedVehicle) {
        throw new Error("Failed to update location");
      }
      
      // Invalidate and refetch queries to ensure UI is up to date
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      await refetch();
      
      toast.success("Location updated successfully");
      onEditEnd();
    } catch (error: any) {
      console.error("Error updating location:", error);
      setErrorMessage(error.message || "Failed to update location");
      toast.error(`Failed to update location: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Try updating location with retry mechanism
  const handleSaveWithRetry = async () => {
    try {
      await retryOperation(handleSave, 3, 1000);
    } catch (error: any) {
      console.error("All retry attempts failed:", error);
      setErrorMessage(`All update attempts failed. Please try again later.`);
    }
  };

  const handleCancel = () => {
    setValue(location); // Reset to original value
    setErrorMessage(null);
    onEditEnd();
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between group">
        <div className={cn(
          "flex items-center gap-2 text-sm",
          "transition-all duration-300 hover:scale-105"
        )}>
          <div className="p-1.5 bg-muted rounded-md">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <span>{location || "Not set"}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEditStart}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit location</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 bg-muted rounded-md">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn("h-8", errorMessage && "border-red-500")}
            placeholder="Enter location"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveWithRetry();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            disabled={isSaving}
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSaveWithRetry}
                className="hover:text-emerald-500 transition-colors"
                disabled={isSaving}
              >
                <Check className={cn("h-4 w-4", isSaving && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save changes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="hover:text-rose-500 transition-colors"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {errorMessage && (
        <div className="text-xs text-red-500 mt-1 ml-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
