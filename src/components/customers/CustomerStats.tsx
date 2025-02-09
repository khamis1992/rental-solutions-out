
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const CustomerStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["customer-stats"],
    queryFn: async () => {
      // Get total customers
      const { count: total } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq('role', 'customer');

      return {
        total: total || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
    </div>
  );
};
