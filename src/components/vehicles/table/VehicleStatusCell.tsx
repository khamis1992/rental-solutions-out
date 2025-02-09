
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
          color: 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25',
          icon: CheckCircle2,
          label: 'Available',
          animation: 'animate-pulse'
        };
      case 'rented':
        return {
          color: 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25',
          icon: Key,
          label: 'Rented',
          animation: ''
        };
      case 'maintenance':
        return {
          color: 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25',
          icon: Wrench,
          label: 'Maintenance',
          animation: ''
        };
      case 'retired':
        return {
          color: 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25',
          icon: Archive,
          label: 'Retired',
          animation: ''
        };
      case 'accident':
        return {
          color: 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25',
          icon: AlertTriangle,
          label: 'Accident',
          animation: 'animate-pulse'
        };
      default:
        return {
          color: 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25',
          icon: Car,
          label: status,
          animation: ''
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "gap-1.5 pl-2 pr-2.5 py-0.5 font-medium capitalize",
        "transition-all duration-300 hover:scale-105",
        config.color,
        config.animation
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
