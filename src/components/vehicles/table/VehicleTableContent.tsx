
import { TableCell, TableRow } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface VehicleTableContentProps {
  vehicles: Vehicle[];
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const VehicleTableContent = ({ 
  vehicles,
  selectedVehicles,
  onSelectionChange 
}: VehicleTableContentProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);

  return (
    <>
      {vehicles.map((vehicle) => (
        <TableRow 
          key={vehicle.id}
          className="group hover:bg-muted/50 transition-colors animate-fade-in"
        >
          <TableCell className="w-12">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={selectedVehicles.includes(vehicle.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectionChange([...selectedVehicles, vehicle.id]);
                } else {
                  onSelectionChange(selectedVehicles.filter(id => id !== vehicle.id));
                }
              }}
            />
          </TableCell>
          <TableCell>
            <Link 
              to={`/vehicles/${vehicle.id}`}
              className="font-medium text-primary hover:underline flex items-center gap-2"
            >
              {vehicle.license_plate}
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {vehicle.vin?.slice(-6)}
              </Badge>
            </Link>
          </TableCell>
          <TableCell className="font-medium">{vehicle.make}</TableCell>
          <TableCell>{vehicle.model}</TableCell>
          <TableCell>{vehicle.year}</TableCell>
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
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Link to={`/vehicles/${vehicle.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
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
                      className="hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Vehicle</p>
                  </TooltipContent>
                </Tooltip>

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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-gray-500/10 hover:text-gray-500 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More Options</p>
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
