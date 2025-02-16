
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VehicleType {
  id: string;
  name: string;
  description: string;
  size: 'compact' | 'mid_size' | 'full_size' | 'luxury';
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  features: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UseVehicleTypesReturn {
  vehicleTypes: VehicleType[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVehicleTypes(): UseVehicleTypesReturn {
  const {
    data: vehicleTypes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching vehicle types:", error);
        throw error;
      }

      return data as VehicleType[];
    },
  });

  return {
    vehicleTypes,
    isLoading,
    isError,
    error,
    refetch: async () => {
      await refetch();
    },
  };
}
