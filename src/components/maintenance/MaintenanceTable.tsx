
import { MaintenanceRecord } from "@/types/maintenance";
import { formatCurrency } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, Wrench } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MaintenanceTableProps {
  maintenanceData: MaintenanceRecord[];
  isLoading: boolean;
}

export const MaintenanceTable = ({ maintenanceData, isLoading }: MaintenanceTableProps) => {
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

  if (isLoading) {
    return <div className="py-10 text-center">Loading maintenance data...</div>;
  }

  if (maintenanceData.length === 0) {
    return <div className="py-10 text-center">No maintenance records found.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maintenanceData.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.service_type}</TableCell>
              <TableCell>
                {record.maintenance_categories?.name || 'General'}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getStatusIcon(record.status)}
                  <span className="ml-2 capitalize">
                    {record.status.replace('_', ' ')}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatDateToDisplay(new Date(record.scheduled_date))}</TableCell>
              <TableCell>{record.cost ? formatCurrency(record.cost) : '-'}</TableCell>
              <TableCell className="max-w-xs truncate">
                {record.description || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
