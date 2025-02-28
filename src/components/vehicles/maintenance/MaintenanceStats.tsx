
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface MaintenanceStatsProps {
  maintenanceData: any[];
}

export const MaintenanceStats = ({ maintenanceData }: MaintenanceStatsProps) => {
  const totalCost = maintenanceData.reduce((sum, record) => sum + (record.cost || 0), 0);
  const completedCount = maintenanceData.filter(record => record.status === 'completed').length;
  const pendingCount = maintenanceData.filter(record => record.status === 'scheduled').length;
  const urgentCount = maintenanceData.filter(record => record.status === 'urgent').length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
            Total Cost
          </CardTitle>
          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Wrench className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Across {maintenanceData.length} maintenance records
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium group-hover:text-green-600 transition-colors">
            Completed
          </CardTitle>
          <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {completedCount > 0 
              ? `${Math.round((completedCount / maintenanceData.length) * 100)}% of all maintenance` 
              : 'No completed maintenance'
            }
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium group-hover:text-blue-600 transition-colors">
            Pending
          </CardTitle>
          <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {pendingCount > 0 
              ? `${Math.round((pendingCount / maintenanceData.length) * 100)}% of all maintenance` 
              : 'No pending maintenance'
            }
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium group-hover:text-red-600 transition-colors">
            Urgent
          </CardTitle>
          <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{urgentCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {urgentCount > 0 
              ? 'Requires immediate attention' 
              : 'No urgent maintenance'
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
