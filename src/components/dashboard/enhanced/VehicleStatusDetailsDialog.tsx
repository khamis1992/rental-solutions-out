
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleStatusCellProps } from "@/types/ui.types";

interface VehicleStatusDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: Vehicle[];
  isLoading: boolean;
  className?: string;
}

export const VehicleStatusDetailsDialog = ({
  isOpen,
  onClose,
  status,
  vehicles,
  isLoading,
  className
}: VehicleStatusDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl", className)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Vehicles with status: {status}
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
              There are no vehicles currently with the status: {status}
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
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {vehicle.year}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
