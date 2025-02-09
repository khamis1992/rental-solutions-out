
import { TableCell, TableRow } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Car, Barcode } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VehicleTableContentProps {
  vehicles: Vehicle[];
}

export const VehicleTableContent = ({ vehicles }: VehicleTableContentProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);

  return (
    <>
      {vehicles.map((vehicle) => (
        <TableRow 
          key={vehicle.id}
          className={cn(
            "group hover:bg-muted/50 transition-all duration-300",
            "animate-fade-in relative",
            "before:absolute before:left-0 before:top-0 before:h-full before:w-1",
            "before:bg-transparent hover:before:bg-primary/50",
            "before:transition-colors before:duration-300"
          )}
        >
          <TableCell>
            <Link 
              to={`/vehicles/${vehicle.id}`}
              className="font-medium text-primary hover:underline flex items-center gap-2 group/link"
            >
              <div className="p-1.5 bg-primary/10 rounded-md group-hover/link:bg-primary/20 transition-colors">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span>{vehicle.license_plate}</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                    "flex items-center gap-1.5 w-fit"
                  )}
                >
                  <Barcode className="h-3 w-3" />
                  {vehicle.vin?.slice(-6)}
                </Badge>
              </div>
            </Link>
          </TableCell>

          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-muted rounded-md">
                <Car className="h-4 w-4 text-muted-foreground" />
              </div>
              {vehicle.make}
            </div>
          </TableCell>

          <TableCell>
            <div className="flex items-center gap-2">
              {vehicle.model}
            </div>
          </TableCell>

          <TableCell>
            <Badge variant="outline" className="font-mono">
              {vehicle.year}
            </Badge>
          </TableCell>

          <TableCell>
            <VehicleStatusCell 
              status={vehicle.status} 
              vehicleId={vehicle.id}
            />
          </TableCell>

          <TableCell>
            <VehicleLocationCell
              vehicleId={vehicle.id}
              location={vehicle.location || ''}
              isEditing={editingLocation === vehicle.id}
              onEditStart={() => setEditingLocation(vehicle.id)}
              onEditEnd={() => setEditingLocation(null)}
            />
          </TableCell>

          <TableCell>
            <VehicleInsuranceCell
              vehicleId={vehicle.id}
              insurance={vehicle.insurance_company || ''}
              isEditing={editingInsurance === vehicle.id}
              onEditStart={() => setEditingInsurance(vehicle.id)}
              onEditEnd={() => setEditingInsurance(null)}
            />
          </TableCell>

          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Vehicle</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

