
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

    // Log summary for monitoring
    const summary = {
      recordCount: data.length,
      totalLateFines: data.reduce((sum: number, item: any) => sum + (Number(item.late_fine_amount) || 0), 0),
      totalTrafficFines: data.reduce((sum: number, item: any) => sum + (Number(item.traffic_fine_amount) || 0), 0),
      totalPendingAmount: data.reduce((sum: number, item: any) => sum + (Number(item.total_amount) || 0), 0)
    };
    console.info("Pending payments report summary:", summary);

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
    toast.error("Failed to load pending payments report", {
      description: err instanceof Error ? err.message : "Please try again or contact support"
    });
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

/**
 * Format a financial value with appropriate styling based on value
 */
export const formatFinancialValue = (amount: number, includeZero = false): { text: string, className: string } => {
  if (amount === 0 && !includeZero) {
    return { text: "—", className: "" };
  }
  
  let className = "font-medium";
  if (amount > 0) {
    className += " text-red-600";
  }
  
  return {
    text: `QAR ${amount.toLocaleString()}`,
    className
  };
};

