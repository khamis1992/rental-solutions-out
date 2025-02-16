
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  DollarSign, 
  Edit, 
  Calendar, 
  Check, 
  X,
  ArrowRight
} from "lucide-react";
import { VehicleType } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";
import { EditVehicleTypeDialog } from "./EditVehicleTypeDialog";

interface VehicleTypesGridProps {
  vehicleTypes: VehicleType[];
  onVehicleTypeUpdated: (vehicleType: VehicleType) => void;
}

export function VehicleTypesGrid({ vehicleTypes, onVehicleTypeUpdated }: VehicleTypesGridProps) {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getSizeColor = (size: string) => {
    const colors: Record<string, string> = {
      compact: 'bg-blue-500',
      mid_size: 'bg-green-500',
      full_size: 'bg-purple-500',
      suv: 'bg-orange-500',
      van: 'bg-yellow-500',
      luxury: 'bg-pink-500'
    };
    return colors[size] || 'bg-gray-500';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vehicleTypes.map((type) => (
        <Card key={type.id} className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={getSizeColor(type.size)}>
                {type.size.replace('_', ' ')}
              </Badge>
              {type.is_active ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <X className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-semibold mt-2">{type.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-primary">
                  {formatCurrency(type.daily_rate)} / day
                </span>
              </div>
              {type.weekly_rate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatCurrency(type.weekly_rate)} / week</span>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground line-clamp-2">
              {type.description}
            </div>

            <div className="flex flex-wrap gap-2">
              {type.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/5">
                  {feature}
                </Badge>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/5"
                onClick={() => {
                  setSelectedType(type);
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedType && (
        <EditVehicleTypeDialog
          vehicleType={selectedType}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onVehicleTypeUpdated={onVehicleTypeUpdated}
        />
      )}
    </div>
  );
}
