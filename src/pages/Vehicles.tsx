
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Plus, Import, Filter, Grid, List, Search } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select();

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return (data || []) as Vehicle[];
    },
  });

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.license_plate?.toLowerCase().includes(searchLower) ||
      vehicle.vin?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6 animate-fade-in">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-blue-900/10 p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 group">
                <div className="p-2 bg-primary/10 rounded-lg transition-all duration-300 group-hover:scale-110">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Vehicle Management</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Manage your fleet, track vehicle status, and monitor maintenance schedules. Efficiently oversee all aspects of your vehicle operations from a central dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CreateVehicleDialog>
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Add Vehicle
                </Button>
              </CreateVehicleDialog>
              <Button variant="outline" className="flex items-center gap-2">
                <Import className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              >
                {viewMode === "list" ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
                {viewMode === "list" ? "Grid View" : "List View"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <VehicleStats vehicles={vehicles} isLoading={isLoading} />

        {/* Vehicle List Section */}
        <Card className="border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Vehicle List</h2>
              <p className="text-muted-foreground">
                View and manage all vehicles in your fleet
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <VehicleList 
              vehicles={filteredVehicles} 
              isLoading={isLoading}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
