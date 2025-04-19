
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

    const doc = new jsPDF();
    
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
      headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
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
        headStyles: { fillColor: [255, 150, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        didDrawPage: (data) => {
          // Add header to each page
          doc.setFontSize(10);
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
