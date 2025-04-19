
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { TrafficFine } from "@/types/traffic-fines";

// Define types for the report data structures
export interface VehicleTrafficFineSummary {
  totalFines: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  totalVehicles: number;
  unassignedFines: number;
  unassignedAmount: number;
}

export interface VehicleTrafficFineReport {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  customerName: string | null;
  fineCount: number;
  totalFines: number;
  fines: TrafficFine[];
}

export interface UnassignedFinesReport {
  fineCount: number;
  totalAmount: number;
  fines: TrafficFine[];
}

// Function to fetch vehicle traffic fines report data
export const fetchVehicleTrafficFinesReport = async () => {
  try {
    // Fetch assigned fines with lease and vehicle information
    const { data: assignedFines, error: assignedError } = await supabase
      .from('traffic_fines')
      .select(`
        *,
        lease:leases(
          id,
          customer:profiles(
            id,
            full_name,
            email
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
      .not('lease_id', 'is', null)
      .order('violation_date', { ascending: false });

    if (assignedError) throw assignedError;

    // Filter out any null leases (shouldn't happen but just in case)
    const validAssignedFines = assignedFines.filter(fine => fine.lease && fine.lease.customer) as TrafficFine[];

    // Fetch unassigned fines
    const { data: unassignedFines, error: unassignedError } = await supabase
      .from('traffic_fines')
      .select('*')
      .is('lease_id', null)
      .order('violation_date', { ascending: false });

    if (unassignedError) throw unassignedError;

    // Group fines by vehicle
    const vehicleFinesMap = validAssignedFines.reduce((map, fine) => {
      if (!fine.lease || !fine.lease.vehicle) return map;
      
      const vehicleId = fine.lease.vehicle.id;
      if (!map.has(vehicleId)) {
        map.set(vehicleId, {
          vehicleId,
          make: fine.lease.vehicle.make,
          model: fine.lease.vehicle.model,
          year: fine.lease.vehicle.year,
          licensePlate: fine.lease.vehicle.license_plate,
          customerName: fine.lease.customer?.full_name || null,
          fineCount: 0,
          totalFines: 0,
          fines: []
        });
      }
      
      const vehicleData = map.get(vehicleId);
      vehicleData.fineCount += 1;
      vehicleData.totalFines += fine.fine_amount || 0;
      vehicleData.fines.push(fine);
      
      return map;
    }, new Map<string, VehicleTrafficFineReport>());

    const vehicleReports = Array.from(vehicleFinesMap.values());

    // Calculate summary statistics
    const totalAmount = validAssignedFines.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    const completedFines = validAssignedFines.filter(fine => fine.payment_status === 'completed');
    const completedAmount = completedFines.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    const pendingAmount = totalAmount - completedAmount;
    
    const unassignedAmount = unassignedFines?.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0) || 0;
    
    // Create a summary object
    const summary: VehicleTrafficFineSummary = {
      totalFines: validAssignedFines.length + (unassignedFines?.length || 0),
      totalAmount: totalAmount + unassignedAmount,
      pendingAmount,
      completedAmount,
      totalVehicles: vehicleReports.length,
      unassignedFines: unassignedFines?.length || 0,
      unassignedAmount
    };

    // Create unassigned fines report
    const unassignedFinesReport: UnassignedFinesReport = {
      fineCount: unassignedFines?.length || 0,
      totalAmount: unassignedAmount,
      fines: unassignedFines || []
    };

    return {
      vehicleReports,
      unassignedFines: unassignedFinesReport,
      summary
    };
  } catch (error) {
    console.error("Error generating traffic fines report:", error);
    throw error;
  }
};

// Export traffic fines to PDF with focus on assigned customer fines
export const exportTrafficFinesToPDF = async () => {
  try {
    // Fetch only assigned traffic fines
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

    // Filter out any null leases (shouldn't happen but just in case)
    const assignedFines = fines.filter(fine => fine.lease && fine.lease.customer);

    const doc = new jsPDF();
    
    // Add title and date
    const reportDate = format(new Date(), 'dd/MM/yyyy');
    doc.setFontSize(18);
    doc.text("Customer Traffic Fines Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${reportDate}`, 14, 30);
    
    // Calculate summary
    const totalAmount = assignedFines.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    const completedFines = assignedFines.filter(fine => fine.payment_status === 'completed');
    const completedAmount = completedFines.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    const pendingAmount = totalAmount - completedAmount;

    // Add summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    
    const summaryData = [
      ['Total Fines', assignedFines.length.toString()],
      ['Total Amount', formatCurrency(totalAmount)],
      ['Pending Amount', formatCurrency(pendingAmount)],
      ['Completed Amount', formatCurrency(completedAmount)]
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

    // Add detailed fines list
    const finesData = assignedFines.map(fine => [
      fine.violation_number || 'N/A',
      `${fine.lease?.vehicle?.year || ''} ${fine.lease?.vehicle?.make || ''} ${fine.lease?.vehicle?.model || ''}`,
      fine.lease?.vehicle?.license_plate || 'N/A',
      fine.lease?.customer?.full_name || 'N/A',
      format(new Date(fine.violation_date), 'dd/MM/yyyy'),
      fine.fine_type || 'N/A',
      formatCurrency(fine.fine_amount || 0),
      fine.payment_status
    ]);

    // Get the Y position after the previous table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Add detailed fines table
    autoTable(doc, {
      startY: finalY,
      head: [
        [
          'Violation #',
          'Vehicle',
          'License Plate',
          'Customer',
          'Date',
          'Type',
          'Amount',
          'Status'
        ]
      ],
      body: finesData,
      theme: 'grid',
      headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      didDrawPage: (data) => {
        // Add header to each page
        doc.setFontSize(10);
        doc.text("Customer Traffic Fines Report", data.settings.margin.left, 10);
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
