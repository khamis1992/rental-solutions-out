
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { toast } from "sonner";
import { useMemo } from "react";
import { getStatusGroup } from "@/components/dashboard/enhanced/VehicleStatusConfig";
import { StatusGroup } from "@/types/dashboard.types";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

export const useVehicleStatus = () => {
  const { data: vehicles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*");

        if (error) {
          throw error;
        }

        return data as Vehicle[];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to fetch vehicles");
        return [];
      }
    },
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((vehicle) => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  const statusGroups = useMemo(() => {
    const grouped: Record<string, { status: VehicleStatus; count: number }[]> = {
      operational: [],
      attention: [],
      critical: [],
    };

    Object.entries(statusCounts).forEach(([status, count]) => {
      const group = getStatusGroup(status);
      grouped[group].push({
        status: status as VehicleStatus,
        count,
      });
    });

    return grouped;
  }, [statusCounts]);

  const groupedStatuses = useMemo<StatusGroup[]>(() => {
    return [
      {
        name: 'operational',
        items: statusGroups.operational,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      },
      {
        name: 'attention',
        items: statusGroups.attention,
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />
      },
      {
        name: 'critical',
        items: statusGroups.critical,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      }
    ];
  }, [statusGroups]);

  return {
    vehicles,
    statusCounts,
    statusGroups,
    groupedStatuses,
    isLoading,
    error,
    refetch,
    totalVehicles: vehicles.length,
    criticalCount: statusGroups.critical.reduce((sum, item) => sum + item.count, 0)
  };
};
