import { useEffect, useState } from "react";
import { VehicleStatus } from "@/types/vehicle";
import { STATUS_CONFIG } from "./VehicleStatusChartV2";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleStatusChartV3Props {
  onStatusClick: (status: VehicleStatus) => void;
}

export const VehicleStatusChartV3 = ({ onStatusClick }: VehicleStatusChartV3Props) => {
  const [vehicleData, setVehicleData] = useState<Array<{ status: VehicleStatus; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const { data, error } = await supabase.rpc('get_vehicle_status_data');
        if (error) throw error;
        setVehicleData(data);
      } catch (error) {
        toast.error("Failed to load vehicle status data: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleData();
  }, []);

  const chartData = vehicleData.map(item => ({
    name: STATUS_CONFIG[item.status]?.label || item.status,
    value: item.count,
    color: STATUS_CONFIG[item.status]?.color || "#000000",
  }));

  return (
    <ChartContainer>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <DonutChart
          data={chartData}
          config={{}}
          primaryValue={vehicleData.reduce((acc, item) => acc + item.count, 0)}
          primaryLabel="Total Vehicles"
        />
      )}
      <ChartTooltip>
        <ChartTooltipContent>
          {vehicleData.map(item => (
            <div key={item.status} onClick={() => onStatusClick(item.status)}>
              {STATUS_CONFIG[item.status]?.label || item.status}: {item.count}
            </div>
          ))}
        </ChartTooltipContent>
      </ChartTooltip>
    </ChartContainer>
  );
};
