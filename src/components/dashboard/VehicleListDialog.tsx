
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleStatusCell } from "../vehicles/table/VehicleStatusCell";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus | null;
}

export const VehicleListDialog = ({ isOpen, onClose, status }: VehicleListDialogProps) => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles-by-status", status],
    queryFn: async () => {
      if (!status) return [];
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", status);

      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!status
  });

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Vehicles - {status?.charAt(0).toUpperCase()}{status?.slice(1)}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
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
              {vehicles?.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.license_plate}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>
                    <VehicleStatusCell status={vehicle.status} vehicleId={vehicle.id} />
                  </TableCell>
                  <TableCell>{vehicle.location || "Not set"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
