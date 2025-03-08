
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceRecord } from "@/types/maintenance";
import { formatCurrency } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { CheckCircle, Clock, AlertTriangle, Wrench } from "lucide-react";

interface MaintenanceCardProps {
  maintenance: MaintenanceRecord;
}

export const MaintenanceCard = ({ maintenance }: MaintenanceCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{maintenance.service_type}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {maintenance.maintenance_categories?.name || 'General'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            {getStatusIcon(maintenance.status)}
            <span className="ml-2 capitalize">{maintenance.status.replace('_', ' ')}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDateToDisplay(new Date(maintenance.scheduled_date))}
          </div>
          {maintenance.cost && (
            <div className="text-sm font-medium">
              {formatCurrency(maintenance.cost)}
            </div>
          )}
          {maintenance.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{maintenance.description}</p>
          )}
          {maintenance.vehicle_parts && maintenance.vehicle_parts.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Parts: </span>
              {maintenance.vehicle_parts.map((part) => part.part_name).join(', ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
