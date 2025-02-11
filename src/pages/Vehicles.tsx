
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleStats } from "@/components/vehicles/VehicleStats";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Plus, Import, Filter, Grid, List, Search, RefreshCw } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: vehicles = [], isLoading, refetch } = useQuery({
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Vehicle data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh vehicle data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="content-container">
        {/* Enhanced Header Section with Gradient */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div className="space-y-3 w-full md:w-auto">
              <div className="flex items-center gap-3 group">
                <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Car className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Vehicle Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage and monitor your entire fleet from one place
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <CreateVehicleDialog>
                <Button className="flex-1 md:flex-none items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Vehicle</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </CreateVehicleDialog>
              
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none items-center gap-2 hover:bg-secondary/10 transition-colors"
              >
                <Import className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none items-center gap-2 hover:bg-secondary/10 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 md:flex-none items-center gap-2 hover:bg-secondary/10 transition-colors"
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              >
                {viewMode === "list" ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {viewMode === "list" ? "Grid View" : "List View"}
                </span>
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "flex-1 md:flex-none items-center gap-2 hover:bg-secondary/10 transition-colors",
                  isRefreshing && "animate-spin"
                )}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Stats Section */}
        <div className="mt-6">
          <VehicleStats vehicles={vehicles} isLoading={isLoading} />
        </div>

        {/* Vehicle List Section */}
        <Card className="mt-6 border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Vehicle List</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all vehicles in your fleet
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 hover:bg-background/80 transition-colors w-full"
                />
              </div>
            </div>

            <div className="overflow-hidden">
              <VehicleList 
                vehicles={filteredVehicles} 
                isLoading={isLoading}
                viewMode={viewMode}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
