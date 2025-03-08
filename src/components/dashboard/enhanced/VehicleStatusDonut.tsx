
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Key, Wrench } from "lucide-react";

interface DonutData {
  name: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

interface VehicleStatusDonutProps {
  data: DonutData[];
  totalVehicles: number;
}

export const VehicleStatusDonut = ({ data, totalVehicles }: VehicleStatusDonutProps) => {
  const RADIAN = Math.PI / 180;
  
  // Enhanced data with icons
  const enhancedData = data.map(item => {
    let icon = null;
    
    // Assign icons based on status name
    if (item.name === "Available") icon = <Check className="h-4 w-4" />;
    else if (item.name === "Rented") icon = <Key className="h-4 w-4" />;
    else if (item.name === "Maintenance") icon = <Wrench className="h-4 w-4" />;
    
    return { ...item, icon };
  });
  
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

  // Custom legend that includes icons
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-4">
        {payload.map((entry: any, index: number) => {
          const item = enhancedData.find(d => d.name === entry.value);
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ backgroundColor: entry.color }}>
                {item?.icon}
              </div>
              <span className="text-sm flex items-center gap-1">
                {entry.value}
                <span className="font-semibold">{item?.value || 0}</span>
              </span>
            </li>
          );
        })}
      </ul>
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
      <div className="relative h-64 w-full max-w-md mb-2">
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
              animationDuration={800}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
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
              content={renderCustomLegend}
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-card/90 backdrop-blur-sm p-3 rounded-full shadow-sm">
            <p className="text-3xl font-bold">{totalVehicles}</p>
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
          </div>
        </div>
      </div>
    </div>
  );
};
