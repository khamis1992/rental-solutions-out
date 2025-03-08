
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface VehicleStatusDonutProps {
  data: DonutData[];
  totalVehicles: number;
}

export const VehicleStatusDonut = ({ data, totalVehicles }: VehicleStatusDonutProps) => {
  const RADIAN = Math.PI / 180;
  
  // Custom label that shows the count and percentage
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const count = data[index].value;
    if (count === 0) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
      >
        {count}
      </text>
    );
  };

  // Handle empty data
  if (data.every(item => item.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-center text-muted-foreground">No vehicle data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative h-64 w-full max-w-md mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={40}
              dataKey="value"
              strokeWidth={3}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} vehicles`, "Count"]}
              contentStyle={{ 
                borderRadius: "8px", 
                border: "1px solid rgba(0,0,0,0.1)", 
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
              }}
            />
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold">{totalVehicles}</p>
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
          </div>
        </div>
      </div>
    </div>
  );
};
