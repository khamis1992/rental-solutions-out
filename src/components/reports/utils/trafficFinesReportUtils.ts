
import { supabase } from "@/integrations/supabase/client";
import { TrafficFine } from "@/types/traffic-fines";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

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

export interface UnassignedTrafficFine extends TrafficFine {
  licensePlateOnly?: boolean;
}

export interface UnassignedFinesReport {
  totalFines: number;
  fineCount: number;
  fines: UnassignedTrafficFine[];
}

export interface VehicleTrafficFineSummary {
  totalVehicles: number;
  totalFines: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  unassignedFines: number;
  unassignedAmount: number;
}

export const fetchVehicleTrafficFinesReport = async (): Promise<{
  vehicleReports: VehicleTrafficFineReport[];
  unassignedFines: UnassignedFinesReport;
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
    
    // Collect unassigned fines
    const unassignedFines: UnassignedTrafficFine[] = [];
    
    // Summary statistics
    const summary: VehicleTrafficFineSummary = {
      totalVehicles: 0,
      totalFines: 0,
      totalAmount: 0,
      pendingAmount: 0,
      completedAmount: 0,
      unassignedFines: 0,
      unassignedAmount: 0
    };

    // Process each fine
    fines?.forEach((fine: any) => {
      // Add fine amount to total summary
      summary.totalFines += 1;
      summary.totalAmount += fine.fine_amount || 0;
      
      if (fine.payment_status === 'completed') {
        summary.completedAmount += fine.fine_amount || 0;
      } else {
        summary.pendingAmount += fine.fine_amount || 0;
      }

      // Check if fine has vehicle information via lease
      if (fine.lease?.vehicle) {
        const vehicle = fine.lease.vehicle;
        const vehicleId = vehicle.id;
        
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
      } else {
        // This is an unassigned fine
        summary.unassignedFines += 1;
        summary.unassignedAmount += fine.fine_amount || 0;
        
        // Save as unassigned
        const unassignedFine = {...fine} as UnassignedTrafficFine;
        
        // Flag fines that have license plate but no vehicle or lease
        if (fine.license_plate) {
          unassignedFine.licensePlateOnly = true;
        }
        
        unassignedFines.push(unassignedFine);
      }
    });
    
    // Set total vehicles count
    summary.totalVehicles = vehicleMap.size;
    
    // Convert map to array
    const vehicleReports = Array.from(vehicleMap.values());
    
    // Sort by total fine amount (descending)
    vehicleReports.sort((a, b) => b.totalFines - a.totalFines);
    
    // Create unassigned fines report
    const unassignedFinesReport: UnassignedFinesReport = {
      totalFines: summary.unassignedAmount,
      fineCount: summary.unassignedFines,
      fines: unassignedFines
    };
    
    return { vehicleReports, unassignedFines: unassignedFinesReport, summary };
  } catch (error) {
    console.error("Failed to fetch vehicle traffic fines report:", error);
    throw error;
  }
};

export const exportVehicleTrafficFinesToCSV = (vehicleReports: VehicleTrafficFineReport[], unassignedFines: UnassignedFinesReport) => {
  // Create CSV header
  const header = [
    "Vehicle",
    "License Plate",
    "Customer",
    "Agreement #",
    "Fine Count",
    "Total Fine Amount"
  ].join(",");
  
  // Create CSV rows for vehicles
  const vehicleRows = vehicleReports.map(report => [
    `${report.year} ${report.make} ${report.model}`,
    report.licensePlate,
    report.customerName || "Not Available",
    report.agreementNumber || "Not Available",
    report.fineCount,
    report.totalFines.toFixed(2)
  ].join(","));
  
  // Add a section for unassigned fines
  const unassignedSection = [
    "Unassigned Fines,,,,"+unassignedFines.fineCount+","+unassignedFines.totalFines.toFixed(2)
  ];
  
  // Combine header and rows
  const csv = [header, ...vehicleRows, "", ...unassignedSection].join("\n");
  
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

export const exportDetailedTrafficFinesToCSV = (vehicleReports: VehicleTrafficFineReport[], unassignedFines: UnassignedFinesReport) => {
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
  
  // Add assigned fines
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
  
  // Add unassigned fines
  unassignedFines.fines.forEach(fine => {
    rows.push([
      "Unassigned",
      fine.license_plate || "N/A",
      "Unassigned",
      "N/A",
      fine.violation_number || "N/A",
      fine.violation_date ? new Date(fine.violation_date).toLocaleDateString() : "N/A",
      fine.fine_type || "N/A",
      fine.fine_location || "N/A",
      fine.fine_amount?.toFixed(2) || "0.00",
      fine.payment_status || "pending"
    ].join(","));
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

export const exportTrafficFinesToPDF = (
  vehicleReports: VehicleTrafficFineReport[], 
  unassignedFines: UnassignedFinesReport,
  summary: VehicleTrafficFineSummary
) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title and date
    const reportDate = format(new Date(), 'dd/MM/yyyy');
    doc.setFontSize(18);
    doc.text("Vehicle Traffic Fines Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${reportDate}`, 14, 30);
    
    // Add summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    
    doc.setFontSize(10);
    const summaryData = [
      ['Total Vehicles', summary.totalVehicles.toString()],
      ['Total Fines', summary.totalFines.toString()],
      ['Total Amount', formatCurrency(summary.totalAmount)],
      ['Pending Amount', formatCurrency(summary.pendingAmount)],
      ['Completed Amount', formatCurrency(summary.completedAmount)],
      ['Unassigned Fines', summary.unassignedFines.toString()],
      ['Unassigned Amount', formatCurrency(summary.unassignedAmount)]
    ];
    
    // Add summary table
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { top: 45 }
    });
    
    // Vehicles section
    const vehicleData = vehicleReports.map(report => [
      `${report.year} ${report.make} ${report.model}`,
      report.licensePlate,
      report.customerName || "Not Available",
      report.agreementNumber || "Not Available",
      report.fineCount.toString(),
      formatCurrency(report.totalFines)
    ]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Vehicle', 'License Plate', 'Customer', 'Agreement #', 'Fine Count', 'Total Fine Amount']],
      body: vehicleData,
      theme: 'grid',
      headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      didDrawPage: (data) => {
        // Add header to each page
        doc.setFontSize(10);
        doc.text("Vehicle Traffic Fines Report", data.settings.margin.left, 10);
      }
    });
    
    // If we have unassigned fines, add another section
    if (unassignedFines.fineCount > 0) {
      doc.addPage();
      
      // Add unassigned fines header
      doc.setFontSize(14);
      doc.text("Unassigned Fines", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Total Unassigned Fines: ${unassignedFines.fineCount}`, 14, 30);
      doc.text(`Total Amount: ${formatCurrency(unassignedFines.totalFines)}`, 14, 37);
      
      // Detailed unassigned fines
      const unassignedData = unassignedFines.fines.map(fine => [
        fine.license_plate || "N/A",
        fine.violation_number || "N/A",
        fine.violation_date ? format(new Date(fine.violation_date), 'dd/MM/yyyy') : "N/A",
        fine.fine_type || "N/A",
        formatCurrency(fine.fine_amount || 0),
        fine.payment_status || "pending"
      ]);
      
      autoTable(doc, {
        startY: 45,
        head: [['License Plate', 'Violation #', 'Date', 'Violation Type', 'Amount', 'Status']],
        body: unassignedData,
        theme: 'grid',
        headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        didDrawPage: (data) => {
          // Add header to each page
          doc.setFontSize(10);
          doc.text("Unassigned Traffic Fines", data.settings.margin.left, 10);
        }
      });
    }
    
    // Save the PDF
    doc.save('traffic_fines_report.pdf');
    
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
};
