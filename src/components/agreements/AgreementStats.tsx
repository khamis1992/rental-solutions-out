
import { FileCheck, FileClock, FileX, FileText, TrendingUp, TrendingDown, Clock, AlertCircle, Activity } from "lucide-react";
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
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        <div className="col-span-full md:col-span-2">
          <StatsCard
            title="Active Agreements"
            value={stats?.active.toString() || "0"}
            icon={FileCheck}
            description={
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span>Currently active</span>
                <div className="flex items-center text-green-500 ml-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs ml-0.5">12%</span>
                </div>
                <div className="ml-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            }
            className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/50 dark:to-emerald-950/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-h-[140px]"
            iconClassName="green"
          />
        </div>

        <StatsCard
          title="Pending Agreements"
          value={stats?.pending.toString() || "0"}
          icon={FileClock}
          description={
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-500" />
              <span className="text-xs">Awaiting action</span>
              <div className="flex items-center ml-1">
                <AlertCircle className="h-3 w-3 text-orange-500 animate-pulse" />
                <span className="text-xs ml-0.5 text-orange-500">{stats?.pending || 0} urgent</span>
              </div>
            </div>
          }
          className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/50 dark:to-amber-950/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-h-[140px]"
          iconClassName="orange"
        />

        <StatsCard
          title="Closed Agreements"
          value={stats?.closed.toString() || "0"}
          icon={FileX}
          description={
            <div className="flex items-center gap-1">
              <span>Completed</span>
              <div className="flex items-center text-red-500 ml-1">
                <TrendingDown className="h-3 w-3" />
                <span className="text-xs ml-0.5">5%</span>
              </div>
              <div className="ml-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            </div>
          }
          className="bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/50 dark:to-rose-950/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-h-[140px]"
          iconClassName="red"
        />

        <StatsCard
          title="Total Agreements"
          value={stats?.total.toString() || "0"}
          icon={FileText}
          description={
            <div className="flex items-center gap-1">
              <span>All time</span>
              <div className="flex items-center text-blue-500 ml-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs ml-0.5">8%</span>
              </div>
              <div className="h-1 w-16 bg-gray-200 rounded-full ml-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${((stats?.active || 0) / (stats?.total || 1)) * 100}%`,
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' 
                  }}
                />
              </div>
            </div>
          }
          className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-h-[140px]"
          iconClassName="blue"
        />
      </div>
    </div>
  );
};
