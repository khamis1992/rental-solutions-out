
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

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
  
  // Setup query client for refetching vehicle data
  const { refetch } = useQuery({
    queryKey: ["vehicles"],
    enabled: false, // Don't run on mount
  });

  const handleSave = async () => {
    if (value === location) {
      // No changes made, just close the editor
      onEditEnd();
      return;
    }
    
    try {
      setIsSaving(true);
      console.log("Updating location for vehicle:", vehicleId, "to:", value);
      
      const { error, data } = await supabase
        .from("vehicles")
        .update({ location: value })
        .eq("id", vehicleId)
        .select();

      if (error) {
        console.error("Error updating location:", error);
        throw error;
      }
      
      console.log("Location update response:", data);
      
      // Refetch vehicles data to update the UI
      await refetch();
      
      toast.success("Location updated successfully");
      onEditEnd();
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(location); // Reset to original value
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
    <div className="flex items-center gap-2 animate-fade-in">
      <div className="flex items-center gap-2 flex-1">
        <div className="p-1.5 bg-muted rounded-md">
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8"
          placeholder="Enter location"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
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
              onClick={handleSave}
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
  );
};
