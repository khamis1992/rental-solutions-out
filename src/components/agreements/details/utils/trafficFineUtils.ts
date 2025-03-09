
import { supabase } from "@/integrations/supabase/client";
import { TrafficFine } from "@/types/traffic-fines";

export const fetchTrafficFines = async (agreementId: string): Promise<TrafficFine[]> => {
  console.log("Fetching traffic fines for agreement:", agreementId);
  
  const { data, error } = await supabase
    .from('traffic_fines')
    .select(`
      id,
      lease_id,
      serial_number,
      violation_number,
      violation_date,
      license_plate,
      fine_location,
      violation_charge,
      fine_amount,
      violation_points,
      payment_status,
      assignment_status,
      created_at,
      updated_at,
      fine_type,
      payment_date
    `)
    .eq('lease_id', agreementId)
    .order('violation_date', { ascending: false });

  if (error) {
    console.error('Error fetching traffic fines:', error);
    throw error;
  }
  
  console.log("Traffic fines fetched:", data);
  return data as TrafficFine[];
};
