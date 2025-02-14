
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, Tools, Battery, Gauge } from "lucide-react";
import { format } from "date-fns";

interface MaintenancePrediction {
  id: string;
  vehicle_id: string;
  prediction_type: 'oil_change' | 'brake_service' | 'battery_replacement' | 'general_maintenance';
  predicted_date: string;
  confidence_score: number;
  predicted_issues: string[];
  recommended_services: string[];
  estimated_cost: number;
  priority: 'low' | 'medium' | 'high';
  ai_model: string;
  ai_analysis_details: Record<string, any>;
}

interface MaintenancePredictionsProps {
  vehicleId: string;
}

export const MaintenancePredictions = ({ vehicleId }: MaintenancePredictionsProps) => {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ["maintenance-predictions", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_predictions")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("predicted_date", { ascending: true });

      if (error) throw error;
      return data as MaintenancePrediction[];
    }
  });

  if (isLoading) {
    return <div>Loading predictions...</div>;
  }

  if (!predictions?.length) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'oil_change':
        return <Gauge className="h-5 w-5" />;
      case 'brake_service':
        return <Tools className="h-5 w-5" />;
      case 'battery_replacement':
        return <Battery className="h-5 w-5" />;
      default:
        return <Tools className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Maintenance Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <Alert
              key={prediction.id}
              className={`border-l-4 ${
                prediction.priority === 'high'
                  ? 'border-l-red-500'
                  : prediction.priority === 'medium'
                  ? 'border-l-yellow-500'
                  : 'border-l-green-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getIcon(prediction.prediction_type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium capitalize mb-1">
                    {prediction.prediction_type.replace('_', ' ')}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Due: {format(new Date(prediction.predicted_date), 'PPP')}</p>
                    <p>Estimated Cost: ${prediction.estimated_cost}</p>
                    {prediction.predicted_issues.length > 0 && (
                      <p>Issues: {prediction.predicted_issues.join(', ')}</p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className={`text-sm font-medium ${getPriorityColor(prediction.priority)}`}>
                    {prediction.priority} priority
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({Math.round(prediction.confidence_score * 100)}% confidence)
                  </span>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
