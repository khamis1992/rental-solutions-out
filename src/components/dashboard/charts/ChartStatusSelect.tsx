
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartStatusSelectProps {
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  statusData: Array<{
    name: string;
    value: number;
    Icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export const ChartStatusSelect = ({ 
  selectedStatus, 
  onStatusChange, 
  statusData 
}: ChartStatusSelectProps) => {
  return (
    <Select 
      value={selectedStatus} 
      onValueChange={onStatusChange}
    >
      <SelectTrigger className={cn(
        "w-[200px] transition-all duration-300",
        "bg-white/50 backdrop-blur-sm",
        "border-gray-200/50 hover:border-gray-300",
        "focus:ring-primary/20"
      )}>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded">
            <Car className="w-4 h-4 text-primary" />
          </div>
          <SelectValue placeholder="All Vehicle Types" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>All Vehicle Types</span>
          </div>
        </SelectItem>
        {statusData?.map((status) => {
          const Icon = status.Icon || Car;
          return (
            <SelectItem 
              key={status.name} 
              value={status.name.toLowerCase()}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{status.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
