
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { injectPrintStyles } from "@/lib/printStyles";

// Adding Arabic font support for jsPDF
const addArabicFontSupport = (doc: jsPDF) => {
  // Add Amiri font which has good Arabic support
  doc.addFont("https://fonts.gstatic.com/s/amiri/v17/J7aRnpd8CGxBHpUutLMS7JNK.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
};

export const exportTrafficFinesToPDF = async () => {
  try {
    // Fetch only assigned traffic fines with customer information
    const { data: fines, error } = await supabase
      .from('traffic_fines')
      .select(`
        *,
        lease:leases(
          id,
          customer:profiles(
            full_name,
            email
          ),
          vehicle:vehicles(
            make,
            model,
            year,
            license_plate
          )
        )
      `)
      .not('lease_id', 'is', null)
      .order('violation_date', { ascending: false });

    if (error) throw error;

    // Filter out any null leases and group by customer
    const assignedFines = fines.filter(fine => fine.lease && fine.lease.customer);
    const customerGroups = groupFinesByCustomer(assignedFines);

    // Create new PDF with Unicode support
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    // Add Arabic font support
    addArabicFontSupport(doc);
    
    // Add title and date
    const reportDate = format(new Date(), 'dd/MM/yyyy');
    doc.setFontSize(18);
    doc.text("Customer Traffic Fines Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${reportDate}`, 14, 30);
    
    // Calculate summary
    const totalAmount = assignedFines.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    const totalFines = assignedFines.length;

    // Add summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    
    const summaryData = [
      ['Total Customers with Fines', customerGroups.length.toString()],
      ['Total Fines', totalFines.toString()],
      ['Total Amount', formatCurrency(totalAmount)]
    ];

    // Add summary table
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255], font: 'Amiri' },
      styles: { fontSize: 10, font: 'Amiri' },
      margin: { top: 45 }
    });

    // Get the Y position after the previous table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Add customer sections
    let currentY = finalY;

    customerGroups.forEach((group, index) => {
      // Add customer header
      doc.setFontSize(12);
      doc.text(`Customer: ${group.customerName}`, 14, currentY);
      
      // Add customer's fines table
      const finesData = group.fines.map(fine => [
        fine.violation_number || 'N/A',
        `${fine.lease?.vehicle?.year || ''} ${fine.lease?.vehicle?.make || ''} ${fine.lease?.vehicle?.model || ''}`,
        fine.lease?.vehicle?.license_plate || 'N/A',
        format(new Date(fine.violation_date), 'dd/MM/yyyy'),
        formatCurrency(fine.fine_amount || 0)
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Violation #', 'Vehicle', 'License Plate', 'Date', 'Amount']],
        body: finesData,
        theme: 'grid',
        headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255], font: 'Amiri' },
        styles: { fontSize: 9, font: 'Amiri' },
        didDrawPage: (data) => {
          // Add header to each page
          doc.setFontSize(10);
          doc.setFont("Amiri");
          doc.text("Customer Traffic Fines Report", data.settings.margin.left, 10);
        }
      });

      // Update Y position for next section
      currentY = (doc as any).lastAutoTable.finalY + 10;

      // Add page break if needed
      if (index < customerGroups.length - 1 && currentY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        currentY = 20;
      }
    });

    // Save the PDF
    doc.save('customer_traffic_fines_report.pdf');
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
};

// Helper function to group fines by customer
const groupFinesByCustomer = (fines: any[]) => {
  const groups = fines.reduce((acc, fine) => {
    const customerId = fine.lease?.customer?.id;
    const customerName = fine.lease?.customer?.full_name;
    
    if (!customerId || !customerName) return acc;

    if (!acc[customerId]) {
      acc[customerId] = {
        customerName,
        fines: []
      };
    }
    
    acc[customerId].fines.push(fine);
    return acc;
  }, {});

  return Object.values(groups);
};

// Export these functions to be used in VehicleTrafficFinesReport.tsx
export interface VehicleTrafficFineSummary {
  totalVehicles: number;
  totalFines: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  unassignedFines: number;
  unassignedAmount: number;
}

export interface VehicleTrafficFineReport {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  customerName?: string;
  fineCount: number;
  totalFines: number;
  pendingFines: number;
  pendingAmount: number;
}

export interface UnassignedFinesReport {
  fineCount: number;
  totalAmount: number;
  fines: any[];
}

export const fetchVehicleTrafficFinesReport = async () => {
  try {
    // Implement the actual function
    const { data: vehicleReports, error } = await supabase.rpc('get_vehicle_traffic_fines_report');
    
    if (error) throw error;
    
    // Fetch unassigned fines
    const { data: unassignedFines, error: unassignedError } = await supabase
      .from('traffic_fines')
      .select('*')
      .is('lease_id', null)
      .order('violation_date', { ascending: false });
      
    if (unassignedError) throw unassignedError;
    
    // Calculate summary statistics
    const summary: VehicleTrafficFineSummary = {
      totalVehicles: vehicleReports?.length || 0,
      totalFines: (vehicleReports || []).reduce((sum: number, v: any) => sum + v.fine_count, 0) + (unassignedFines?.length || 0),
      totalAmount: (vehicleReports || []).reduce((sum: number, v: any) => sum + v.total_fines, 0) + 
                  (unassignedFines || []).reduce((sum: number, f: any) => sum + (f.fine_amount || 0), 0),
      pendingAmount: (vehicleReports || []).reduce((sum: number, v: any) => sum + v.pending_amount, 0) +
                    (unassignedFines || []).filter((f: any) => f.payment_status !== 'completed')
                    .reduce((sum: number, f: any) => sum + (f.fine_amount || 0), 0),
      completedAmount: (vehicleReports || []).reduce((sum: number, v: any) => sum + (v.total_fines - v.pending_amount), 0) +
                      (unassignedFines || []).filter((f: any) => f.payment_status === 'completed')
                      .reduce((sum: number, f: any) => sum + (f.fine_amount || 0), 0),
      unassignedFines: unassignedFines?.length || 0,
      unassignedAmount: (unassignedFines || []).reduce((sum: number, f: any) => sum + (f.fine_amount || 0), 0)
    };

    // Process for frontend display
    const formattedVehicleReports = (vehicleReports || []).map((v: any) => ({
      vehicleId: v.vehicle_id,
      make: v.make,
      model: v.model,
      year: v.year,
      licensePlate: v.license_plate,
      customerName: v.customer_name,
      fineCount: v.fine_count,
      totalFines: v.total_fines,
      pendingFines: v.pending_fines,
      pendingAmount: v.pending_amount
    }));

    // Enhancement: Mark license plate only fines
    const enhancedUnassignedFines = (unassignedFines || []).map((f: any) => ({
      ...f,
      licensePlateOnly: Boolean(f.license_plate && !f.violation_number)
    }));

    return {
      vehicleReports: formattedVehicleReports,
      unassignedFines: {
        fineCount: enhancedUnassignedFines.length,
        totalAmount: enhancedUnassignedFines.reduce((sum: number, f: any) => sum + (f.fine_amount || 0), 0),
        fines: enhancedUnassignedFines
      },
      summary
    };
  } catch (error) {
    console.error("Failed to fetch vehicle traffic fines report:", error);
    throw error;
  }
};

export const exportVehicleTrafficFinesToCSV = (vehicles: VehicleTrafficFineReport[], unassigned: UnassignedFinesReport) => {
  // Not implementing CSV export as this wasn't requested in the change
  console.log("CSV export called but not implemented");
};

export const exportDetailedTrafficFinesToCSV = (vehicles: VehicleTrafficFineReport[], unassigned: UnassignedFinesReport) => {
  // Not implementing CSV export as this wasn't requested in the change
  console.log("Detailed CSV export called but not implemented");
};

export const exportTrafficFinesToPDF = (vehicles: VehicleTrafficFineReport[], unassigned: any, summary: VehicleTrafficFineSummary) => {
  // Not implementing this specific PDF export as this wasn't requested in the change
  console.log("Vehicle traffic fines PDF export called but not implemented");
};
