
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import type { MaintenanceRecord } from "@/types/maintenance";

interface MaintenanceStatsProps {
  maintenanceData?: MaintenanceRecord[];
}

export const MaintenanceStats = ({ maintenanceData = [] }: MaintenanceStatsProps) => {
  // Calculate total cost - only sum defined cost values
  const totalCost = maintenanceData?.reduce((sum, record) => 
    sum + (typeof record.cost === 'number' ? record.cost : 0), 0) || 0;

  // Count records by status
  const completedCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'completed').length || 0;
  
  const pendingCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'scheduled' || 
    record.status?.toLowerCase() === 'in_progress').length || 0;
  
  const urgentCount = maintenanceData?.filter(record => 
    record.status?.toLowerCase() === 'urgent').length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white/50 to-white/30">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-between space-y-4">
            <div className="p-3 rounded-full bg-primary/10 ring-1 ring-primary/20 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Total Cost
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white/50 to-white/30">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-between space-y-4">
            <div className="p-3 rounded-full bg-green-500/10 ring-1 ring-green-500/20 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{completedCount}</p>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white/50 to-white/30">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-between space-y-4">
            <div className="p-3 rounded-full bg-blue-500/10 ring-1 ring-blue-500/20 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{pendingCount}</p>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Pending
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white/50 to-white/30">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-between space-y-4">
            <div className="p-3 rounded-full bg-red-500/10 ring-1 ring-red-500/20 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
              <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{urgentCount}</p>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Urgent
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
