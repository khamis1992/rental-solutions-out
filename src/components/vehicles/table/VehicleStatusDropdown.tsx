
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleStatus } from "@/types/vehicle";
import { ChevronDown, Check } from "lucide-react";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { cn } from "@/lib/utils";

interface VehicleStatusDropdownProps {
  currentStatus: VehicleStatus;
  availableStatuses: { id: string; name: VehicleStatus }[];
  onStatusChange: (status: VehicleStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function VehicleStatusDropdown({
  currentStatus,
  availableStatuses,
  onStatusChange,
  isLoading,
  disabled,
}: VehicleStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-[200px] justify-start",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled || isLoading}
        >
          <VehicleStatusCell status={currentStatus} vehicleId="" />
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {availableStatuses.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption.id}
            onClick={() => onStatusChange(statusOption.name)}
            className="flex items-center gap-2"
          >
            <VehicleStatusCell 
              status={statusOption.name} 
              vehicleId="" 
              className="shrink-0"
            />
            <span className="flex-1">{statusOption.name}</span>
            {currentStatus === statusOption.name && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
