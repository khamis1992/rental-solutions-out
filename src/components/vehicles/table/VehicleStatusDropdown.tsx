
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleStatus } from "@/types/vehicle";
import { Loader2 } from "lucide-react";
import { VehicleStatusDropdownProps } from "@/types/ui.types";

export const VehicleStatusDropdown = ({
  currentStatus,
  availableStatuses,
  onStatusChange,
  isLoading = false,
  disabled = false,
}: VehicleStatusDropdownProps) => {
  const handleChange = (value: string) => {
    onStatusChange(value as VehicleStatus);
  };

  return (
    <div className="w-full max-w-[180px] relative">
      <Select 
        value={currentStatus} 
        onValueChange={handleChange}
        disabled={isLoading || disabled}
      >
        <SelectTrigger className="w-full h-8">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => (
            <SelectItem key={status.id} value={status.name}>
              {status.name.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isLoading && (
        <div className="absolute right-8 top-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
