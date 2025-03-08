
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface VehicleStatusDonutProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  totalVehicles: number;
}

// Default colors if not provided
const COLORS = ['#10b981', '#f97316', '#f59e0b', '#6b7280'];

export const VehicleStatusDonut: React.FC<VehicleStatusDonutProps> = ({ data, totalVehicles }) => {
  // Add colors to data if not provided
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length],
  }));

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} vehicles`, 'Count']}
              contentStyle={{ borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <div className="text-sm text-muted-foreground">Total Vehicles</div>
        <div className="text-2xl font-bold">{totalVehicles}</div>
      </div>
    </div>
  );
};
