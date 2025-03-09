
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
  try {
    // Call the updated SQL function with proper error handling
    const { data, error } = await supabase.rpc('get_pending_payments_report');

    if (error) {
      console.error("Error fetching pending payments report:", error.message, error.details);
      throw new Error(`Failed to fetch report: ${error.message}`);
    }

    if (!data) {
      console.warn("No data returned from pending payments report");
      return [];
    }

    // Validate and transform data to ensure type safety
    const reportData = data.map((item: any): PendingPaymentReport => ({
      agreement_number: item.agreement_number || '',
      customer_name: item.customer_name || '',
      id_number: item.id_number || '',
      phone_number: item.phone_number || '',
      pending_rent_amount: Number(item.pending_rent_amount) || 0,
      late_fine_amount: Number(item.late_fine_amount) || 0,
      traffic_fine_amount: Number(item.traffic_fine_amount) || 0,
      total_amount: Number(item.total_amount) || 0,
      license_plate: item.license_plate || ''
    }));

    return reportData;
  } catch (err) {
    console.error("Failed to fetch pending payments report:", err);
    throw err;
  }
};

export const exportPendingPaymentsToCSV = (data: PendingPaymentReport[]) => {
  // Define headers
  const headers = [
    "Agreement Number",
    "Customer Name",
    "ID Number",
    "Phone Number",
    "Pending Rent Amount",
    "Late Fine Amount",
    "Traffic Fine Amount",
    "Total Amount",
    "License Plate"
  ];
  
  // Format data rows
  const rows = data.map(item => [
    item.agreement_number,
    item.customer_name,
    item.id_number,
    item.phone_number,
    item.pending_rent_amount.toString(),
    item.late_fine_amount.toString(),
    item.traffic_fine_amount.toString(),
    item.total_amount.toString(),
    item.license_plate
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create downloadable CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pending_payments_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
