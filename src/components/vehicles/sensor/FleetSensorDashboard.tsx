
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Battery, Gauge, Thermometer, AlertTriangle, Car } from "lucide-react";
import { toast } from "sonner";

interface TirePressure {
  front_left: number;
  front_right: number;
  rear_left: number;
  rear_right: number;
}

interface VehicleSensorData {
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
  vehicle?: {
    license_plate: string;
    make: string;
    model: string;
    year: number;
  };
}

export const FleetSensorDashboard = () => {
  const { data: sensorData, isLoading } = useQuery({
    queryKey: ["fleet-sensor-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_sensor_data")
        .select(`
          *,
          vehicle:vehicles(license_plate, make, model, year)
        `)
        .order("timestamp", { ascending: false });

      if (error) {
        toast.error("Failed to fetch fleet sensor data");
        throw error;
      }

      // Group by vehicle and get latest reading for each
      const latestReadings = data.reduce((acc: { [key: string]: VehicleSensorData }, reading: VehicleSensorData) => {
        if (!acc[reading.vehicle_id] || new Date(reading.timestamp) > new Date(acc[reading.vehicle_id].timestamp)) {
          acc[reading.vehicle_id] = reading;
        }
        return acc;
      }, {});

      return Object.values(latestReadings);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <Card className="p-6">
      <CardHeader>
        <CardTitle>Loading Fleet Sensor Data...</CardTitle>
      </CardHeader>
    </Card>;
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value <= thresholds.critical) return "text-red-500";
    if (value <= thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  const vehiclesNeedingAttention = sensorData?.filter(reading => 
    reading.battery_health < 50 ||
    reading.fuel_level < 20 ||
    reading.engine_temperature > 100 ||
    reading.check_engine_status ||
    reading.brake_pad_wear < 20 ||
    reading.oil_life_remaining < 30
  ) || [];

  return (
    <div className="space-y-6">
      {vehiclesNeedingAttention.length > 0 && (
        <Alert className="bg-red-50 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            {vehiclesNeedingAttention.length} vehicle(s) need attention
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sensorData?.map((reading) => (
          <Card key={reading.id} className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {reading.vehicle?.year} {reading.vehicle?.make} {reading.vehicle?.model}
                </div>
                <span className="text-sm font-normal text-muted-foreground">
                  {reading.vehicle?.license_plate}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Battery
                  </span>
                  <span className={`font-bold ${getStatusColor(reading.battery_health, { warning: 50, critical: 30 })}`}>
                    {Math.round(reading.battery_health)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Fuel
                  </span>
                  <span className={`font-bold ${getStatusColor(reading.fuel_level, { warning: 30, critical: 15 })}`}>
                    {Math.round(reading.fuel_level)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature
                  </span>
                  <span className={`font-bold ${reading.engine_temperature > 100 ? 'text-red-500' : 'text-green-500'}`}>
                    {Math.round(reading.engine_temperature)}°C
                  </span>
                </div>

                {reading.check_engine_status && (
                  <Alert className="mt-2 py-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-500 text-sm">
                      Check Engine Light ON
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
