
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, CheckCircle, Clock, Wrench, Bell, 
  Filter, Car, CircleEllipsis, ArrowRight
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface AnomalyRecord {
  id: string;
  detection_type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  affected_records: {
    vehicle_id: string;
    license_plate: string;
    mileage: number;
  };
  detected_at: string;
  resolved_at: string | null;
}

export function MaintenanceAlerts() {
  const { data: anomalies, isLoading } = useQuery({
    queryKey: ['maintenance-anomalies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operational_anomalies')
        .select(`
          *,
          affected_records
        `)
        .eq('detection_type', 'maintenance_required')
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data as unknown as AnomalyRecord[];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('maintenance-anomalies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'operational_anomalies',
          filter: 'detection_type=eq.maintenance_required'
        },
        (payload) => {
          toast.warning("New maintenance alert detected!", {
            description: payload.new.description
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200 ring-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 ring-yellow-500';
      case 'low':
        return 'bg-blue-500/10 text-blue-700 border-blue-200 ring-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200 ring-gray-500';
    }
  };

  const getStatusIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeElapsed = (date: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const highPriorityCount = anomalies?.filter(a => a.severity === 'high').length || 0;
  const mediumPriorityCount = anomalies?.filter(a => a.severity === 'medium').length || 0;
  const lowPriorityCount = anomalies?.filter(a => a.severity === 'low').length || 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-6 w-6 text-orange-500" />
              {anomalies && anomalies.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Maintenance Alerts
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {highPriorityCount > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {highPriorityCount} High
              </Badge>
            )}
            {mediumPriorityCount > 0 && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {mediumPriorityCount} Medium
              </Badge>
            )}
            {lowPriorityCount > 0 && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                <Wrench className="h-3 w-3 mr-1" />
                {lowPriorityCount} Low
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="hover:bg-orange-100/50">
            <Filter className="h-4 w-4 mr-1" /> All
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-red-100/50">
            <AlertTriangle className="h-4 w-4 mr-1" /> High Priority
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-yellow-100/50">
            <Clock className="h-4 w-4 mr-1" /> Medium Priority
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : anomalies && anomalies.length > 0 ? (
            <div className="space-y-4 mt-4">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`group relative rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${
                    getSeverityColor(anomaly.severity)
                  } hover:scale-[1.02] animate-fade-in`}
                >
                  <div className="absolute -left-1 top-0 h-full w-1 rounded-l-lg bg-current opacity-50" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(anomaly.severity)}
                      <Badge className={`${getSeverityColor(anomaly.severity)} ring-1 ring-current ring-opacity-20`}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getTimeElapsed(anomaly.detected_at)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{anomaly.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <span>{anomaly.affected_records.license_plate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CircleEllipsis className="h-4 w-4" />
                      <span>{anomaly.affected_records.mileage.toLocaleString()} km</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="outline" size="sm" className="h-8">
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
              <p>No maintenance alerts at this time</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
