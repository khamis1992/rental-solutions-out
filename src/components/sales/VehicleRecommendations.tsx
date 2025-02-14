
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Car, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
}

interface VehicleRecommendation {
  id: string;
  vehicle: Vehicle;
  match_score: number;
  status: string;
  notes: string;
}

interface VehicleRecommendationsProps {
  leadId: string;
}

export const VehicleRecommendations = ({ leadId }: VehicleRecommendationsProps) => {
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ["vehicle-recommendations", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_recommendations")
        .select(`
          id,
          match_score,
          status,
          notes,
          vehicle:vehicles (
            id,
            make,
            model,
            year,
            color,
            license_plate
          )
        `)
        .eq("lead_id", leadId)
        .order("match_score", { ascending: false });

      if (error) throw error;
      return data as VehicleRecommendation[];
    }
  });

  const updateRecommendationStatus = async (recommendationId: string, status: string) => {
    const { error } = await supabase
      .from("vehicle_recommendations")
      .update({ status })
      .eq("id", recommendationId);

    if (error) {
      toast.error("Failed to update recommendation status");
      return;
    }

    toast.success("Recommendation status updated");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations?.map((recommendation) => (
              <div
                key={recommendation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {recommendation.vehicle.make} {recommendation.vehicle.model} {recommendation.vehicle.year}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.vehicle.color} • {recommendation.vehicle.license_plate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={recommendation.match_score > 70 ? "default" : "secondary"}>
                    {recommendation.match_score}% Match
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => updateRecommendationStatus(recommendation.id, "accepted")}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={() => updateRecommendationStatus(recommendation.id, "rejected")}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {recommendations?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No vehicle recommendations available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
