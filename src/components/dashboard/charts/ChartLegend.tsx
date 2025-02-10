
import React from 'react';
import { cn } from '@/lib/utils';

interface ChartLegendProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    Icon?: React.ComponentType<{ className?: string }>;
  }>;
  onStatusSelect: (status: string) => void;
}

export const ChartLegend = ({ data, onStatusSelect }: ChartLegendProps) => {
  return (
    <div className="w-full space-y-3 py-4">
      {data?.map((status, index) => {
        const Icon = status.Icon;
        return (
          <div 
            key={index} 
            onClick={() => onStatusSelect(status.name.toLowerCase())}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
              "transition-all duration-300",
              "hover:bg-gray-50 dark:hover:bg-gray-800/50",
              "group relative",
              "before:absolute before:inset-0 before:rounded-lg",
              "before:border before:border-transparent",
              "hover:before:border-gray-200 dark:hover:before:border-gray-700",
              "before:transition-colors before:duration-300"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <div 
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "transition-all duration-300 group-hover:scale-110"
                )}
                style={{ backgroundColor: `${status.color}15` }}
              >
                {Icon && <Icon className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  "group-hover:scale-110"
                )} style={{ color: status.color }} />}
              </div>
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {status.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(status.value / data.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                    backgroundColor: status.color 
                  }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {status.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
