
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ location: value })
        .eq("id", vehicleId);

      if (error) throw error;
      toast.success("Location updated successfully");
      onEditEnd();
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between group/location">
        <div className={cn(
          "flex items-center gap-2 text-sm",
          "transition-all duration-300 hover:scale-105 group-hover:text-primary"
        )}>
          <div className="p-1.5 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
            <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
                className="opacity-0 group-hover/location:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
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
            >
              <Check className="h-4 w-4" />
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
              onClick={onEditEnd}
              className="hover:text-rose-500 transition-colors"
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
