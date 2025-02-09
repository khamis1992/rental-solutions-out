
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { 
  Wrench, Clock, AlertTriangle, CheckCircle, XCircle, Car, 
  Calendar, User, DollarSign, Info, FileText, Settings, 
  Gauge, Cable, Filter, RefreshCw, Clipboard, CircuitBoard
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateJobDialog } from "./CreateJobDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTablePagination } from "@/components/vehicles/table/VehicleTablePagination";
import type { MaintenanceRecord } from "@/types/maintenance";
import { MaintenanceStats } from "./MaintenanceStats";
import { MaintenanceAlerts } from "./MaintenanceAlerts";

const ITEMS_PER_PAGE = 10;

const getServiceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'oil change':
      return <Filter className="h-8 w-8 text-primary" />;
    case 'tire rotation':
      return <RefreshCw className="h-8 w-8 text-primary" />;
    case 'inspection':
      return <Clipboard className="h-8 w-8 text-primary" />;
    case 'brake service':
      return <Cable className="h-8 w-8 text-primary" />;
    case 'engine repair':
      return <Settings className="h-8 w-8 text-primary" />;
    case 'accident repair':
      return <AlertTriangle className="h-8 w-8 text-red-500" />;
    default:
      return <Wrench className="h-8 w-8 text-primary" />;
  }
};

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
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

export const MaintenanceList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("all");

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ["maintenance-and-accidents"],
    queryFn: async () => {
      const { data: maintenanceRecords, error: maintenanceError } = await supabase
        .from("maintenance")
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          )
        `)
        .not('status', 'in', '("completed","cancelled")')
        .order('scheduled_date', { ascending: false });

      if (maintenanceError) throw maintenanceError;

      const { data: accidentVehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select(`
          id,
          make,
          model,
          license_plate
        `)
        .eq('status', 'accident');

      if (vehiclesError) throw vehiclesError;

      const accidentRecords: MaintenanceRecord[] = accidentVehicles.map(vehicle => ({
        id: `accident-${vehicle.id}`,
        vehicle_id: vehicle.id,
        service_type: 'Accident Repair',
        status: 'scheduled',
        scheduled_date: new Date().toISOString(),
        cost: null,
        description: 'Vehicle reported in accident status',
        vehicles: vehicle,
        completed_date: null,
        performed_by: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: null
      }));

      return [...maintenanceRecords, ...accidentRecords].sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    },
  });

  const handleStatusChange = async (recordId: string, newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
      toast.success('Job card deleted successfully');
    } catch (error) {
      console.error('Error deleting job card:', error);
      toast.error('Failed to delete job card');
    }
  };

  const filteredRecords = records.filter(record => {
    if (filter === "all") return true;
    return record.status === filter;
  });

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load maintenance records. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const activeMaintenanceCount = records.filter(record => 
    record.status !== 'completed' && record.status !== 'cancelled'
  ).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="w-full bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 shadow-md">
        <div className="relative overflow-hidden p-6">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 opacity-20">
            <CircuitBoard className="w-full h-full text-orange-500 animate-pulse" />
          </div>
          
          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg transform hover:scale-110 transition-transform duration-200">
                  <Wrench className="h-8 w-8 text-white animate-[spin_3s_linear_infinite]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-transparent bg-clip-text">
                    Maintenance
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track and manage all vehicle maintenance activities efficiently
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="outline" 
                  className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1 animate-fade-in"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  {activeMaintenanceCount} Active Tasks
                </Badge>
                <Badge 
                  variant="outline" 
                  className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 animate-fade-in"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Updated {formatDateToDisplay(new Date())}
                </Badge>
              </div>
            </div>
            
            <CreateJobDialog />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <div className="animate-fade-in">
          <MaintenanceAlerts />
        </div>

        <MaintenanceStats maintenanceData={records} />

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform duration-200"
          >
            <Wrench className="h-4 w-4" />
            All Records
          </Button>
          {["scheduled", "in_progress", "urgent", "completed", "cancelled"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className={`flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform duration-200 ${
                status === 'urgent' ? 'hover:bg-red-50' :
                status === 'completed' ? 'hover:bg-green-50' :
                status === 'in_progress' ? 'hover:bg-blue-50' :
                'hover:bg-gray-50'
              }`}
            >
              {getStatusIcon(status)}
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </Button>
          ))}
        </div>

        {records.length === 0 ? (
          <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-orange-100 border-2 border-orange-200">
                <Wrench className="h-12 w-12 text-primary animate-bounce" />
              </div>
              <p className="text-xl font-semibold text-gray-800">No maintenance records found</p>
              <p className="text-sm text-gray-600 max-w-md">
                Create a new maintenance job to start tracking vehicle maintenance and repairs
              </p>
              <CreateJobDialog />
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {currentRecords.map((record) => (
              <Card 
                key={record.id} 
                className={`group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in relative 
                  before:absolute before:left-0 before:top-0 before:h-full before:w-1
                  ${
                    record.status === 'urgent' ? 'before:bg-red-500 hover:bg-red-50/30' :
                    record.status === 'in_progress' ? 'before:bg-blue-500 hover:bg-blue-50/30' :
                    record.status === 'completed' ? 'before:bg-green-500 hover:bg-green-50/30' :
                    record.status === 'cancelled' ? 'before:bg-gray-500 hover:bg-gray-50/30' :
                    'before:bg-yellow-500 hover:bg-yellow-50/30'
                  } 
                  hover:scale-[1.02] transition-transform duration-200
                  bg-gradient-to-br from-white to-gray-50/30`}
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <Select
                      value={record.status}
                      onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") => 
                        handleStatusChange(record.id, value)
                      }
                    >
                      <SelectTrigger className={`w-[130px] ${getStatusColor(record.status)}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Scheduled
                          </div>
                        </SelectItem>
                        <SelectItem value="in_progress">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Cancelled
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <EditMaintenanceDialog record={record} />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center items-center space-x-2 bg-gray-50/50 p-3 rounded-lg hover:bg-gray-100/50 transition-colors">
                    <Car className="h-6 w-6 text-primary" />
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        {record.vehicles 
                          ? `${record.vehicles.make} ${record.vehicles.model}`
                          : "Vehicle details unavailable"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.vehicles?.license_plate || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg space-y-3 shadow-sm group-hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(record.service_type)}
                      <p className="text-lg font-medium">{record.service_type}</p>
                    </div>
                    {record.description && (
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="text-sm text-gray-600 leading-relaxed">{record.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {formatDateToDisplay(new Date(record.scheduled_date))}
                      </span>
                    </div>
                    {record.cost && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-primary">{record.cost}</span>
                        <span className="text-sm text-gray-500">QAR</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {records.length > 0 && (
          <div className="flex justify-center mt-6">
            <VehicleTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
