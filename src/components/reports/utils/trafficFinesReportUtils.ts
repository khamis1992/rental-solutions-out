
import { supabase } from "@/integrations/supabase/client";
import { TrafficFine } from "@/types/traffic-fines";

export interface VehicleTrafficFineReport {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  totalFines: number;
  fineCount: number;
  customerName: string | null;
  agreementNumber: string | null;
  customerId: string | null;
  fines: TrafficFine[];
}

export interface VehicleTrafficFineSummary {
  totalVehicles: number;
  totalFines: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
}

export const fetchVehicleTrafficFinesReport = async (): Promise<{
  vehicleReports: VehicleTrafficFineReport[];
  summary: VehicleTrafficFineSummary;
}> => {
  try {
    // Fetch all traffic fines with related information
    const { data: fines, error } = await supabase
      .from('traffic_fines')
      .select(`
        *,
        lease:leases(
          agreement_number,
          customer_id,
          vehicle_id,
          customer:profiles(
            full_name
          ),
          vehicle:vehicles(
            id,
            make,
            model,
            year,
            license_plate
          )
        )
      `)
      .order('violation_date', { ascending: false });

    if (error) {
      console.error("Error fetching traffic fines report data:", error);
      throw error;
    }

    // Process and organize data by vehicle
    const vehicleMap = new Map<string, VehicleTrafficFineReport>();
    
    // Summary statistics
    const summary: VehicleTrafficFineSummary = {
      totalVehicles: 0,
      totalFines: 0,
      totalAmount: 0,
      pendingAmount: 0,
      completedAmount: 0
    };

    // Process each fine
    fines?.forEach((fine: any) => {
      if (!fine.lease?.vehicle) return; // Skip if no vehicle data
      
      const vehicle = fine.lease.vehicle;
      const vehicleId = vehicle.id;
      
      // Add fine amount to summary
      summary.totalFines += 1;
      summary.totalAmount += fine.fine_amount || 0;
      
      if (fine.payment_status === 'completed') {
        summary.completedAmount += fine.fine_amount || 0;
      } else {
        summary.pendingAmount += fine.fine_amount || 0;
      }
      
      // Create or update vehicle entry
      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, {
          vehicleId,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.license_plate,
          totalFines: 0,
          fineCount: 0,
          customerName: fine.lease?.customer?.full_name || null,
          agreementNumber: fine.lease?.agreement_number || null,
          customerId: fine.lease?.customer_id || null,
          fines: []
        });
      }
      
      // Update vehicle entry
      const vehicleReport = vehicleMap.get(vehicleId)!;
      vehicleReport.fineCount += 1;
      vehicleReport.totalFines += fine.fine_amount || 0;
      vehicleReport.fines.push(fine as TrafficFine);
    });
    
    // Set total vehicles count
    summary.totalVehicles = vehicleMap.size;
    
    // Convert map to array
    const vehicleReports = Array.from(vehicleMap.values());
    
    // Sort by total fine amount (descending)
    vehicleReports.sort((a, b) => b.totalFines - a.totalFines);
    
    return { vehicleReports, summary };
  } catch (error) {
    console.error("Failed to fetch vehicle traffic fines report:", error);
    throw error;
  }
};

export const exportVehicleTrafficFinesToCSV = (vehicleReports: VehicleTrafficFineReport[]) => {
  // Create CSV header
  const header = [
    "Vehicle",
    "License Plate",
    "Customer",
    "Agreement #",
    "Fine Count",
    "Total Fine Amount"
  ].join(",");
  
  // Create CSV rows
  const rows = vehicleReports.map(report => [
    `${report.year} ${report.make} ${report.model}`,
    report.licensePlate,
    report.customerName || "Not Available",
    report.agreementNumber || "Not Available",
    report.fineCount,
    report.totalFines.toFixed(2)
  ].join(","));
  
  // Combine header and rows
  const csv = [header, ...rows].join("\n");
  
  // Create and download CSV file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "vehicle_traffic_fines_report.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDetailedTrafficFinesToCSV = (vehicleReports: VehicleTrafficFineReport[]) => {
  // Create CSV header
  const header = [
    "Vehicle",
    "License Plate",
    "Customer",
    "Agreement #",
    "Violation #",
    "Violation Date",
    "Violation Type",
    "Fine Location",
    "Fine Amount",
    "Status"
  ].join(",");
  
  // Create CSV rows - one row per fine
  const rows: string[] = [];
  
  vehicleReports.forEach(report => {
    report.fines.forEach(fine => {
      rows.push([
        `${report.year} ${report.make} ${report.model}`,
        report.licensePlate,
        report.customerName || "Not Available",
        report.agreementNumber || "Not Available",
        fine.violation_number || "N/A",
        fine.violation_date ? new Date(fine.violation_date).toLocaleDateString() : "N/A",
        fine.fine_type || "N/A",
        fine.fine_location || "N/A",
        fine.fine_amount?.toFixed(2) || "0.00",
        fine.payment_status || "pending"
      ].join(","));
    });
  });
  
  // Combine header and rows
  const csv = [header, ...rows].join("\n");
  
  // Create and download CSV file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "detailed_traffic_fines_report.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
