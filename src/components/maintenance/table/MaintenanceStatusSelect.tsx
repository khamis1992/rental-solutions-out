
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle, Wrench, AlertTriangle, XCircle, Clock
} from "lucide-react";

interface MaintenanceStatusSelectProps {
  id: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
  vehicleId: string;
}

export const MaintenanceStatusSelect = ({ id, status, vehicleId }: MaintenanceStatusSelectProps) => {
  const queryClient = useQueryClient();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4 text-blue-500 animate-spin-slow" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleStatusChange = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      console.log("Current record:", { id, status, vehicleId });
      console.log("Updating maintenance status to:", newStatus);

      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (maintenanceError) throw maintenanceError;

      const newVehicleStatus = (newStatus === 'completed' || newStatus === 'cancelled') 
        ? 'available' 
        : 'maintenance';

      console.log("Updating vehicle status to:", newVehicleStatus);
      
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: newVehicleStatus })
        .eq('id', vehicleId);

      if (vehicleError) throw vehicleError;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] })
      ]);

      toast.success('Status updated successfully');
    } catch (error: any) {
      console.error("Error in handleStatusChange:", error);
      toast.error('Failed to update status');
    }
  };

  if (status === 'urgent') {
    return (
      <Badge variant="destructive" className={getStatusColor('urgent')}>
        {getStatusIcon('urgent')}
        <span className="ml-2">Urgent</span>
      </Badge>
    );
  }

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <Badge className={getStatusColor(status)}>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
            </div>
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="scheduled">
          <Badge className={getStatusColor('scheduled')}>
            <div className="flex items-center gap-2">
              {getStatusIcon('scheduled')}
              <span>Scheduled</span>
            </div>
          </Badge>
        </SelectItem>
        <SelectItem value="in_progress">
          <Badge className={getStatusColor('in_progress')}>
            <div className="flex items-center gap-2">
              {getStatusIcon('in_progress')}
              <span>In Progress</span>
            </div>
          </Badge>
        </SelectItem>
        <SelectItem value="completed">
          <Badge className={getStatusColor('completed')}>
            <div className="flex items-center gap-2">
              {getStatusIcon('completed')}
              <span>Completed</span>
            </div>
          </Badge>
        </SelectItem>
        <SelectItem value="cancelled">
          <Badge className={getStatusColor('cancelled')}>
            <div className="flex items-center gap-2">
              {getStatusIcon('cancelled')}
              <span>Cancelled</span>
            </div>
          </Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
