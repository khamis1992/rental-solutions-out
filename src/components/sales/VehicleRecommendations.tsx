
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { VehicleRecommendation } from "@/types/sales.types";

interface VehicleRecommendationsProps {
  leadId: string;
}

export const VehicleRecommendations = ({ leadId }: VehicleRecommendationsProps) => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["vehicle-recommendations", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_recommendations")
        .select(`
          *,
          vehicle:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          )
        `)
        .eq("lead_id", leadId)
        .order("match_score", { ascending: false });

      if (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
      }

      return data as VehicleRecommendation[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No vehicle recommendations yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Recommended Vehicles</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {rec.vehicle ? (
                <div className="space-y-2">
                  <div className="font-medium">
                    {rec.vehicle.year} {rec.vehicle.make} {rec.vehicle.model}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rec.vehicle.license_plate}
                  </div>
                  {rec.match_score && (
                    <Badge variant="secondary">
                      Match Score: {rec.match_score}%
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Vehicle details not available
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
