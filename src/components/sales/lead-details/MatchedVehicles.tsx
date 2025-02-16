
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleMatch } from "@/types/vehicle-matching";
import { Vehicle } from "@/types/vehicle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface MatchedVehiclesProps {
  leadId: string;
  onScheduleTestDrive?: (vehicleId: string) => void;
}

export function MatchedVehicles({ leadId, onScheduleTestDrive }: MatchedVehiclesProps) {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["vehicle-matches", leadId],
    queryFn: async () => {
      const { data: matchData, error: matchError } = await supabase
        .from("vehicle_matches")
        .select("*, vehicle:vehicles(*)")
        .eq("lead_id", leadId)
        .order("match_score", { ascending: false });

      if (matchError) throw matchError;

      return matchData as (VehicleMatch & { vehicle: Vehicle })[];
    },
  });

  if (isLoading) {
    return <div>Loading matched vehicles...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matched Vehicles</CardTitle>
        <CardDescription>
          Vehicles that match this lead's preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matched vehicles found
            </p>
          ) : (
            matches?.map((match) => (
              <Card key={match.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">
                        {match.vehicle.year} {match.vehicle.make}{" "}
                        {match.vehicle.model}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          Match Score: {Math.round(match.match_score)}%
                        </Badge>
                        <Badge
                          variant="outline"
                          className="capitalize"
                        >
                          {match.vehicle.status}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        Color: {match.vehicle.color || "N/A"}
                      </p>
                      <p className="text-sm">
                        Mileage:{" "}
                        {match.vehicle.mileage?.toLocaleString() || "N/A"} km
                      </p>
                    </div>
                    {onScheduleTestDrive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => onScheduleTestDrive(match.vehicle.id)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Test Drive
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
