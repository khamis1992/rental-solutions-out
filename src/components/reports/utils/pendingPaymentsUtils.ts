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

// Calculate late fine based on payment date and due date
export const calculateLateFine = (paymentDate: Date, dueDate: Date, dailyRate: number = 120): number => {
  if (paymentDate <= dueDate) return 0;
  
  // Calculate days overdue (excluding the due date itself)
  const daysOverdue = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Return the calculated late fine
  return daysOverdue * dailyRate;
};

// Get the first day of a month from any date
export const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Calculate days overdue from the first of the month
export const calculateDaysOverdue = (paymentDate: Date): number => {
  const firstOfMonth = getFirstDayOfMonth(paymentDate);
  
  // If payment was made on the 1st, no late fee
  if (paymentDate.getDate() === 1) return 0;
  
  // Otherwise calculate days overdue (payment date - first of month)
  return Math.floor((paymentDate.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24));
};

// Define type for missing payment records response
export interface MissingPaymentResult {
  agreement_number: string;
  status_description: string;
  fixed: number;
  errors: string[];
  missingAgreements: string[];
}

// Function to check and fix missing payment records
export const checkMissingPaymentRecords = async (): Promise<MissingPaymentResult> => {
  try {
    // Call the SQL function to generate missing payment records
    const { data, error } = await supabase.rpc('generate_missing_payment_records');
    
    if (error) {
      console.error("Error generating missing payment records:", error);
      return { 
        fixed: 0, 
        errors: [error.message], 
        missingAgreements: [],
        agreement_number: '',
        status_description: 'Error generating records'
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("No data returned from generate_missing_payment_records");
      return {
        fixed: 0,
        errors: ['No data returned from function'],
        missingAgreements: [],
        agreement_number: '',
        status_description: 'No missing payment records to fix'
      };
    }
    
    // Process data returned from the function (which is from the leases_missing_payments view)
    const missingAgreements = data.map(d => d.agreement_number).filter(Boolean);
    
    // Create meaningful result
    return {
      fixed: data.length,
      errors: data.map(d => `${d.agreement_number || 'Unknown'}: ${d.status_description || 'Unknown status'}`),
      missingAgreements,
      agreement_number: missingAgreements[0] || '',
      status_description: data[0]?.status_description || 'Processing completed'
    };
  } catch (e: any) {
    console.error("Error in checkMissingPaymentRecords:", e);
    return { 
      fixed: 0, 
      errors: [e.toString()], 
      missingAgreements: [],
      agreement_number: '',
      status_description: 'Error processing records'
    };
  }
};

// Function to process historical payments for a specific agreement
export const processHistoricalPayments = async (agreementId: string): Promise<{ success: boolean, message: string }> => {
  try {
    console.log("Processing historical payments for agreement:", agreementId);
    const { data, error } = await supabase.functions.invoke('process-rent-schedules', {
      body: { agreementId, processHistorical: true }
    });
    
    if (error) {
      console.error("Error processing historical payments:", error);
      return { 
        success: false, 
        message: `Failed to process historical payments: ${error.message}` 
      };
    }
    
    console.log("Historical payment processing result:", data);
    return { 
      success: true, 
      message: data?.message || 'Historical payments processed successfully' 
    };
  } catch (e: any) {
    console.error("Error in processHistoricalPayments:", e);
    return { 
      success: false, 
      message: `Error processing historical payments: ${e.toString()}` 
    };
  }
};
