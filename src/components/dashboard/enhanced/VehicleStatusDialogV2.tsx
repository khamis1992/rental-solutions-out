
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VehicleStatusCell } from "@/components/vehicles/table/VehicleStatusCell";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { STATUS_CONFIG } from "./VehicleStatusChartV2";
import { useState, useCallback } from "react";
import { VehicleStatusDetailsDialog } from "./VehicleStatusDetailsDialog";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VehicleStatusDropdown } from "@/components/vehicles/table/VehicleStatusDropdown";

interface VehicleStatusDialogV2Props {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
}

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

  // Fetch available statuses
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
                  <TableHead>License Plate</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="group">
                    <TableCell>
                      <button 
                        onClick={(e) => handleVehicleClick(vehicle.id, e)}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
                      >
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
                      <VehicleStatusDropdown
                        currentStatus={vehicle.status}
                        availableStatuses={availableStatuses || []}
                        onStatusChange={(newStatus) => updateVehicleStatus(vehicle.id, newStatus)}
                        isLoading={updatingVehicleId === vehicle.id}
                        disabled={!availableStatuses}
                      />
                    </TableCell>
                    <TableCell>{vehicle.location || "N/A"}</TableCell>
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
