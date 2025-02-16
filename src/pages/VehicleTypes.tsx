
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleTypesGrid } from "@/components/vehicles/types/VehicleTypesGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleType } from "@/types/vehicle";
import { Card, CardContent } from "@/components/ui/card";

export default function VehicleTypes() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicleTypes = [], isLoading, refetch } = useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as VehicleType[];
    },
  });

  const filteredTypes = vehicleTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVehicleTypeUpdated = (updatedType: VehicleType) => {
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vehicle Types</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle Type
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicle types..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <VehicleTypesGrid
              vehicleTypes={filteredTypes}
              onVehicleTypeUpdated={handleVehicleTypeUpdated}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
