
import { ChartDataPoint } from "@/types/dashboard.types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface VehicleStatusDonutProps {
  data: ChartDataPoint[];
  totalVehicles: number;
  config?: {
    width?: number;
    height?: number;
    innerRadius?: number;
    outerRadius?: number;
  };
}

export const VehicleStatusDonut = ({ 
  data, 
  totalVehicles,
  config = {
    width: 300,
    height: 300,
    innerRadius: 60,
    outerRadius: 100,
  }
}: VehicleStatusDonutProps) => {
  return (
    <div className="relative">
      <ResponsiveContainer width={config.width} height={config.height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            paddingAngle={1}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} vehicles`, 'Count']}
            labelFormatter={(index: number) => data[index].name}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold">{totalVehicles}</p>
        <p className="text-sm text-muted-foreground">Total Vehicles</p>
      </div>
    </div>
  );
};
