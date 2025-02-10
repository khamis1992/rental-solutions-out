
import { TableCell, TableRow } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Car, 
  Copy, 
  Shield, 
  Info,
  Calendar,
  MapPin
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VehicleTableContentProps {
  vehicles: Vehicle[];
}

export const VehicleTableContent = ({ vehicles }: VehicleTableContentProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("License plate copied to clipboard");
  };

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
            "before:transition-colors before:duration-300",
            "hover:scale-[1.01] hover:shadow-lg",
            "backdrop-blur-sm hover:backdrop-blur-md"
          )}
        >
          <TableCell>
            <Link 
              to={`/vehicles/${vehicle.id}`}
              className="font-medium text-primary hover:underline flex items-center gap-2 group/link"
            >
              <div className="p-1.5 bg-primary/10 rounded-md group-hover/link:bg-primary/20 transition-colors">
                <Car className="h-4 w-4 text-primary group-hover/link:scale-110 transition-transform" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">{vehicle.license_plate}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          copyToClipboard(vehicle.license_plate);
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy license plate</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Link>
          </TableCell>

          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-muted rounded-md">
                <Car className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">{vehicle.make}</span>
            </div>
          </TableCell>

          <TableCell>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{vehicle.model}</span>
            </div>
          </TableCell>

          <TableCell>
            <Badge 
              variant="outline" 
              className={cn(
                "font-mono bg-muted/50 hover:bg-muted transition-colors",
                "group-hover:border-primary/50",
                "flex items-center gap-1.5"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
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
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Details</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
