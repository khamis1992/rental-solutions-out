
import { useEffect, useState } from "react";
import { VehicleStatus } from "@/types/vehicle";
import { STATUS_CONFIG } from "./VehicleStatusChartV2";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export const VehicleStatusChartV3 = () => {
  const [vehicleData, setVehicleData] = useState<Array<{ status: VehicleStatus; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('status')
          .then(result => {
            if (result.error) throw result.error;
            
            // Count vehicles by status
            const counts: Record<string, number> = {};
            result.data.forEach(vehicle => {
              counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
            });
            
            return Object.entries(counts).map(([status, count]) => ({
              status: status as VehicleStatus,
              count
            }));
          });

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

  const chartConfig = {
    width: 320,
    height: 320,
    innerRadius: 70,
    outerRadius: 110,
  };

  return (
    <Card className="p-6">
      <ChartContainer>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DonutChart
            data={chartData}
            config={chartConfig}
            primaryValue={vehicleData.reduce((acc, item) => acc + item.count, 0)}
            primaryLabel="Total Vehicles"
          />
        )}
        <ChartTooltip>
          <ChartTooltipContent>
            {vehicleData.map(item => (
              <div 
                key={item.status} 
                onClick={() => setSelectedStatus(item.status)}
                className="cursor-pointer hover:bg-accent p-1 rounded"
              >
                {STATUS_CONFIG[item.status]?.label || item.status}: {item.count}
              </div>
            ))}
          </ChartTooltipContent>
        </ChartTooltip>
      </ChartContainer>
    </Card>
  );
};
