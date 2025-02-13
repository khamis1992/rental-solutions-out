
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  customerCount: number;
  adminCount: number;
  unverifiedCount: number;
  missingDocsCount: number;
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<UserStats> => {
      console.log('Fetching user stats...');
      
      // Get customer count
      const { count: customerCount, error: customerError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (customerError) {
        console.error('Error counting customers:', customerError);
        throw customerError;
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

      return {
        customerCount: customerCount || 0,
        adminCount: adminCount || 0,
        unverifiedCount: unverifiedCount || 0,
        missingDocsCount: missingDocsCount || 0
      };
    },
  });
};
