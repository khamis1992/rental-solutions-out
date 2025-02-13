
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  verifiedCount: number;
  adminCount: number;
  unverifiedCount: number;
  missingDocsCount: number;
  newCustomersCount: number;
  growthPercentage: number;
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<UserStats> => {
      console.log('Fetching user stats...');
      
      // Get verified count (customers with complete profiles)
      const { count: verifiedCount, error: verifiedError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .not('status', 'eq', 'pending_review')
        .not('full_name', 'is', null)
        .not('phone_number', 'is', null)
        .not('address', 'is', null)
        .not('driver_license', 'is', null)
        .not('id_document_url', 'is', null)
        .not('license_document_url', 'is', null);

      if (verifiedError) {
        console.error('Error counting verified customers:', verifiedError);
        throw verifiedError;
      }

      // Get admin count
      const { count: adminCount, error: adminError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminError) {
        console.error('Error counting admins:', adminError);
        throw adminError;
      }

      // Get unverified count (pending review status)
      const { count: unverifiedCount, error: unverifiedError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .eq('status', 'pending_review');

      if (unverifiedError) {
        console.error('Error counting unverified:', unverifiedError);
        throw unverifiedError;
      }

      // Get missing docs count
      const { count: missingDocsCount, error: missingDocsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .or('driver_license.is.null,id_document_url.is.null,license_document_url.is.null');

      if (missingDocsError) {
        console.error('Error counting missing docs:', missingDocsError);
        throw missingDocsError;
      }

      // Get new customers this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newCustomersCount, error: newCustomersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', startOfMonth.toISOString());

      if (newCustomersError) {
        console.error('Error counting new customers:', newCustomersError);
        throw newCustomersError;
      }

      // Get last month's customer count for growth percentage
      const startOfLastMonth = new Date(startOfMonth);
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

      const { count: lastMonthCount, error: lastMonthError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .lte('created_at', startOfMonth.toISOString());

      if (lastMonthError) {
        console.error('Error counting last month customers:', lastMonthError);
        throw lastMonthError;
      }

      // Calculate growth percentage
      const growthPercentage = lastMonthCount ? ((newCustomersCount || 0) / lastMonthCount) * 100 : 0;

      return {
        verifiedCount: verifiedCount || 0,
        adminCount: adminCount || 0,
        unverifiedCount: unverifiedCount || 0,
        missingDocsCount: missingDocsCount || 0,
        newCustomersCount: newCustomersCount || 0,
        growthPercentage
      };
    },
  });
};
