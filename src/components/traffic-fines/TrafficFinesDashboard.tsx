
import { useQuery } from "@tanstack/react-query";
import { TrafficFineStats } from "./TrafficFineStats";
import { TrafficFineImport } from "./TrafficFineImport";
import { TrafficFinesList } from "./TrafficFinesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrafficCone, Car } from "lucide-react";

export function TrafficFinesDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("violation_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: finesCount = 0, refetch } = useQuery({
    queryKey: ["traffic-fines-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('traffic_fines')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col space-y-6">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/0 p-6 border backdrop-blur-sm">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg animate-pulse">
                <TrafficCone className="h-8 w-8 text-orange-500" />
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Car className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Traffic Fines Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage traffic violations, fines, and payments efficiently
              </p>
            </div>
          </div>
        </div>
        
        <Card className="bg-white/50 backdrop-blur-sm border-orange-500/20">
          <CardContent className="p-6">
            <ErrorBoundary>
              <TrafficFineStats paymentCount={finesCount || 0} />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors border-orange-500/20">
        <CardContent className="p-6">
          <ErrorBoundary>
            <TrafficFineImport />
          </ErrorBoundary>
        </CardContent>
      </Card>
      
      <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors border-orange-500/20">
        <CardContent className="p-6">
          <ErrorBoundary>
            <TrafficFinesList 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
