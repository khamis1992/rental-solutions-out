
import { FileCheck, FileClock, FileX, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const AgreementStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['agreements-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('status', { count: 'exact' });

      if (error) throw error;

      const counts = {
        active: 0,
        closed: 0,
        pending: 0,
        total: 0
      };

      if (data) {
        data.forEach((item) => {
          counts.total++;
          switch (item.status) {
            case 'active':
              counts.active++;
              break;
            case 'closed':
              counts.closed++;
              break;
            case 'pending_deposit':
            case 'pending_payment':
              counts.pending++;
              break;
          }
        });
      }

      return counts;
    },
    staleTime: 30000,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Agreements"
        value={stats?.active.toString() || "0"}
        icon={FileCheck}
        description={
          <div className="flex items-center gap-1">
            <span>Currently active rentals</span>
            <div className="flex items-center text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">12%</span>
            </div>
          </div>
        }
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
        iconClassName="green"
      />
      <StatsCard
        title="Pending Agreements"
        value={stats?.pending.toString() || "0"}
        icon={FileClock}
        description={
          <div className="flex items-center gap-1">
            <span>Awaiting processing</span>
            <div className="ml-1 h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          </div>
        }
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50"
        iconClassName="orange"
      />
      <StatsCard
        title="Closed Agreements"
        value={stats?.closed.toString() || "0"}
        icon={FileX}
        description={
          <div className="flex items-center gap-1">
            <span>Completed rentals</span>
            <div className="flex items-center text-red-500">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs">5%</span>
            </div>
          </div>
        }
        className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50"
        iconClassName="red"
      />
      <StatsCard
        title="Total Agreements"
        value={stats?.total.toString() || "0"}
        icon={FileText}
        description={
          <div className="flex items-center gap-1">
            <span>All time</span>
            <div className="flex items-center text-blue-500">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">8%</span>
            </div>
          </div>
        }
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
        iconClassName="blue"
      />
    </div>
  );
};
