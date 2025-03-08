
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { VehicleStatus } from "@/types/vehicle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STATUS_CONFIG } from "./VehicleStatusConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportIcon, PrinterIcon, DownloadIcon } from "lucide-react";

export interface VehicleStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: VehicleStatus;
  vehicles: any[];
  isLoading: boolean;
}

export const VehicleStatusDialog = ({
  isOpen,
  onClose,
  status,
  vehicles,
  isLoading,
}: VehicleStatusDialogProps) => {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {statusConfig?.icon && <span>{statusConfig.icon}</span>}
            <span>{statusConfig?.label || status} Vehicles</span>
          </DialogTitle>
          <DialogDescription>
            {vehicles.length} vehicles with status "{statusConfig?.label || status}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] mt-4 rounded-md border p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-3 w-[180px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No vehicles with this status</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors"
                >
                  <div>
                    <h4 className="font-medium">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      License: {vehicle.license_plate} | VIN: {vehicle.vin || "N/A"}
                    </p>
                  </div>
                  <Badge variant="outline">{vehicle.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <PrinterIcon className="h-4 w-4" />
              Print
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <ReportIcon className="h-4 w-4" />
              Report
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
