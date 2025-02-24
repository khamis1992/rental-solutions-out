
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  CheckCircle2, 
  Tool, 
  Key, 
  Clock, 
  XCircle,
  ChevronDown,
  Check,
  MapPin,
  Settings,
  Calendar,
  Info
} from "lucide-react";
import { STATUS_CONFIG } from "./VehicleStatusChartV2";
import { useState, useCallback } from "react";
import { VehicleStatusDetailsDialog } from "./VehicleStatusDetailsDialog";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface VehicleStatusDialogV2Props {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
}

const StatusIcon = {
  available: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  maintenance: <Tool className="h-4 w-4 text-orange-500" />,
  rented: <Key className="h-4 w-4 text-blue-500" />,
  reserved: <Clock className="h-4 w-4 text-purple-500" />,
  unavailable: <XCircle className="h-4 w-4 text-red-500" />,
} as const;

export const VehicleStatusDialogV2 = ({
  isOpen,
  onClose,
  status,
  vehicles,
  isLoading,
}: VehicleStatusDialogV2Props) => {
  const [selectedNestedStatus, setSelectedNestedStatus] = useState<VehicleStatus | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [updatingVehicleId, setUpdatingVehicleId] = useState<string | null>(null);
  const statusConfig = STATUS_CONFIG[status];

  const { data: availableStatuses } = useQuery({
    queryKey: ["vehicle-statuses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_statuses")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const filteredVehicles = selectedNestedStatus 
    ? vehicles.filter(v => v.status === selectedNestedStatus)
    : [];

  const handleStatusClick = (clickedStatus: VehicleStatus) => {
    setSelectedNestedStatus(clickedStatus);
  };

  const handleVehicleClick = (vehicleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVehicleId(vehicleId);
  };

  const updateVehicleStatus = useCallback(async (vehicleId: string, newStatus: VehicleStatus) => {
    setUpdatingVehicleId(vehicleId);
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ status: newStatus })
        .eq("id", vehicleId);

      if (error) {
        throw error;
      }

      toast.success(`Vehicle status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      toast.error("Failed to update vehicle status");
    } finally {
      setUpdatingVehicleId(null);
    }
  }, []);

  const renderStatusDropdown = (vehicleId: string, currentStatus: VehicleStatus) => {
    const statusIcon = StatusIcon[currentStatus as keyof typeof StatusIcon] || <Car className="h-4 w-4" />;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center justify-between w-[180px] px-3 py-2 rounded-md border",
            "text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50 disabled:pointer-events-none",
            updatingVehicleId === vehicleId ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"
          )}
          disabled={updatingVehicleId === vehicleId}
        >
          <div className="flex items-center gap-2">
            {statusIcon}
            <span>{currentStatus}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {availableStatuses?.map((statusOption) => {
            const icon = StatusIcon[statusOption.name as keyof typeof StatusIcon] || <Car className="h-4 w-4" />;
            return (
              <DropdownMenuItem
                key={statusOption.id}
                className="flex items-center justify-between"
                onClick={() => updateVehicleStatus(vehicleId, statusOption.name as VehicleStatus)}
              >
                <div className="flex items-center gap-2">
                  {icon}
                  <span>{statusOption.name}</span>
                </div>
                {currentStatus === statusOption.name && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${statusConfig?.color}15` }}
              >
                <Car className="h-5 w-5" style={{ color: statusConfig?.color }} />
              </div>
              {statusConfig?.label || status} Vehicles
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Car className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No vehicles found</h3>
              <p className="text-muted-foreground">
                There are no vehicles currently with the status: {statusConfig?.label || status}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="flex items-center gap-2">
                    <Car className="h-4 w-4" /> License Plate
                  </TableHead>
                  <TableHead className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Make
                  </TableHead>
                  <TableHead className="flex items-center gap-2">
                    <Info className="h-4 w-4" /> Model
                  </TableHead>
                  <TableHead className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Year
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow 
                    key={vehicle.id} 
                    className="group hover:bg-muted/50 transition-all duration-200"
                  >
                    <TableCell>
                      <button 
                        onClick={(e) => handleVehicleClick(vehicle.id, e)}
                        className="flex items-center gap-2 font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Car className="h-4 w-4" />
                        {vehicle.license_plate}
                      </button>
                    </TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {vehicle.year}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {renderStatusDropdown(vehicle.id, vehicle.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {vehicle.location || "N/A"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <VehicleStatusDetailsDialog
        isOpen={!!selectedNestedStatus}
        onClose={() => setSelectedNestedStatus(null)}
        status={selectedNestedStatus || "available"}
        vehicles={filteredVehicles}
        isLoading={isLoading}
      />

      <VehicleDetailsDialog
        vehicleId={selectedVehicleId || ''}
        open={!!selectedVehicleId}
        onOpenChange={(open) => {
          if (!open) setSelectedVehicleId(null);
        }}
      />
    </>
  );
};
