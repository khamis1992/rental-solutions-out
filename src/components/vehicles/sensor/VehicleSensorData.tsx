
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Battery, Gauge, Thermometer, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface VehicleSensorDataProps {
  vehicleId: string;
}

interface TirePressure {
  front_left: number;
  front_right: number;
  rear_left: number;
  rear_right: number;
}

interface SensorDataResponse {
  id: string;
  vehicle_id: string;
  tire_pressure: TirePressure;
  brake_pad_wear: number;
  oil_life_remaining: number;
  check_engine_status: boolean;
  battery_health: number;
  fuel_level: number;
  engine_temperature: number;
  mileage: number;
  timestamp: string;
  created_at: string;
}

export const VehicleSensorData = ({ vehicleId }: VehicleSensorDataProps) => {
  // Fetch latest sensor data
  const { data: sensorData, isLoading } = useQuery({
    queryKey: ["vehicle-sensor-data", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_sensor_data")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        toast.error("Failed to fetch sensor data");
        throw error;
      }
      return data as SensorDataResponse;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <Card className="p-6">
      <CardHeader>
        <CardTitle>Sensor Data Loading...</CardTitle>
      </CardHeader>
    </Card>;
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Real-time Sensor Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensorData && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Battery Health
                  </span>
                  <span className={`font-bold ${sensorData.battery_health < 50 ? 'text-red-500' : 'text-green-500'}`}>
                    {sensorData.battery_health}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Fuel Level
                  </span>
                  <span className={`font-bold ${sensorData.fuel_level < 20 ? 'text-red-500' : 'text-green-500'}`}>
                    {sensorData.fuel_level}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Engine Temperature
                  </span>
                  <span className={`font-bold ${sensorData.engine_temperature > 100 ? 'text-red-500' : 'text-green-500'}`}>
                    {sensorData.engine_temperature}°C
                  </span>
                </div>
              </div>

              {sensorData.check_engine_status && (
                <Alert className="col-span-full bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-500">
                    Check Engine Light is ON - Service Required
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
