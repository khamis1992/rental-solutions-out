
import { supabase } from "@/integrations/supabase/client";

export interface PendingPaymentReport {
  agreement_number: string;
  customer_name: string;
  id_number: string;
  phone_number: string;
  pending_rent_amount: number;
  late_fine_amount: number;
  traffic_fine_amount: number;
  total_amount: number;
  license_plate: string;
}

export const fetchPendingPaymentsReport = async (): Promise<PendingPaymentReport[]> => {
  const currentDate = new Date();
  const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Format date for query
  const firstOfMonthFormatted = firstOfMonth.toISOString();
  
  const { data, error } = await supabase.rpc('get_pending_payments_report');

  if (error) {
    console.error("Error fetching pending payments report:", error);
    throw error;
  }

  // If no data from RPC, try to fetch with a regular query
  if (!data) {
    const { data: queryData, error: queryError } = await supabase
      .from('leases')
      .select(`
        id,
        agreement_number,
        customer_id,
        vehicle_id,
        rent_amount,
        status,
        customer:profiles(
          full_name, 
          driver_license,
          phone_number
        ),
        vehicle:vehicles(
          license_plate
        )
      `)
      .eq('status', 'active');

    if (queryError) {
      console.error("Error fetching agreements:", queryError);
      throw queryError;
    }

    if (!queryData) {
      return [];
    }

    // Fetch all payments for this month
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('unified_payments')
      .select('lease_id, amount_paid, payment_date, late_fine_amount')
      .gte('payment_date', firstOfMonthFormatted);

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      throw paymentsError;
    }

    // Fetch all traffic fines
    const { data: finesData, error: finesError } = await supabase
      .from('traffic_fines')
      .select('lease_id, fine_amount, payment_status');

    if (finesError) {
      console.error("Error fetching traffic fines:", finesError);
      throw finesError;
    }

    // Process the data
    return queryData.map(agreement => {
      // Find payments for this agreement
      const agreementPayments = paymentsData?.filter(p => p.lease_id === agreement.id) || [];
      const totalPaid = agreementPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
      const lateFines = agreementPayments.reduce((sum, p) => sum + (p.late_fine_amount || 0), 0);
      
      // Find unpaid traffic fines
      const unpaidFines = finesData?.filter(
        f => f.lease_id === agreement.id && f.payment_status !== 'completed'
      ) || [];
      const trafficFinesTotal = unpaidFines.reduce((sum, f) => sum + (f.fine_amount || 0), 0);
      
      // Calculate pending rent (monthly rent - amount paid this month)
      const pendingRent = agreement.rent_amount - totalPaid;
      
      return {
        agreement_number: agreement.agreement_number || '',
        customer_name: agreement.customer?.full_name || '',
        id_number: agreement.customer?.driver_license || '',
        phone_number: agreement.customer?.phone_number || '',
        pending_rent_amount: Math.max(0, pendingRent),
        late_fine_amount: lateFines,
        traffic_fine_amount: trafficFinesTotal,
        total_amount: Math.max(0, pendingRent) + lateFines + trafficFinesTotal,
        license_plate: agreement.vehicle?.license_plate || ''
      };
    });
  }

  return data as PendingPaymentReport[];
};
