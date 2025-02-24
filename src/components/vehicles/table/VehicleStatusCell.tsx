
import { Badge } from "@/components/ui/badge";
import { VehicleStatus } from "@/types/vehicle";
import { Car, Wrench, Archive, AlertTriangle, Key, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleStatusCellProps {
  status: VehicleStatus;
  vehicleId: string;
}

export const VehicleStatusCell = ({ status }: VehicleStatusCellProps) => {
  const getStatusConfig = (status: VehicleStatus) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25',
          icon: CheckCircle2,
          label: 'Available',
          variant: 'success'
        };
      case 'rented':
        return {
          color: 'bg-[#3B82F6]/15 text-[#3B82F6] hover:bg-[#3B82F6]/25',
          icon: Key,
          label: 'Rented',
          variant: 'rented'
        };
      case 'maintenance':
        return {
          color: 'bg-[#F59E0B]/15 text-[#F59E0B] hover:bg-[#F59E0B]/25',
          icon: Wrench,
          label: 'Maintenance',
          variant: 'maintenance'
        };
      case 'retired':
        return {
          color: 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25',
          icon: Archive,
          label: 'Retired',
          variant: 'outline'
        };
      case 'accident':
        return {
          color: 'bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25',
          icon: AlertTriangle,
          label: 'Accident',
          variant: 'accident'
        };
      case 'police_station':
        return {
          color: 'bg-[#8B5CF6]/15 text-[#8B5CF6] hover:bg-[#8B5CF6]/25',
          icon: AlertTriangle,
          label: 'Police Station',
          variant: 'police_station'
        };
      case 'stolen':
        return {
          color: 'bg-[#1F2937]/15 text-[#1F2937] hover:bg-[#1F2937]/25',
          icon: AlertTriangle,
          label: 'Stolen',
          variant: 'stolen'
        };
      case 'reserve':
        return {
          color: 'bg-[#8B5CF6]/15 text-[#8B5CF6] hover:bg-[#8B5CF6]/25',
          icon: Car,
          label: 'Reserved',
          variant: 'reserve'
        };
      default:
        return {
          color: 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25',
          icon: Car,
          label: status,
          variant: 'outline'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "gap-1.5 pl-2 pr-2.5 py-0.5 font-medium capitalize",
        "transition-all duration-300 hover:scale-105",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
