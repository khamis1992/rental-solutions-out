
/**
 * InvoiceDialog Component
 * 
 * This component displays a dialog with agreement invoice information.
 * It provides controls for viewing, printing, and downloading the invoice.
 * 
 * The component fetches invoice data based on the agreement ID and renders
 * it in a printable format with options for export and printing.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceView } from "./InvoiceView";
import { useQuery, useMutation } from "@tanstack/react-query";
import { generateInvoiceData } from "./utils/invoiceUtils";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PrintButton } from "@/components/print/PrintButton";
import { PrintSettingsProvider } from "@/contexts/PrintSettingsContext";

/**
 * Props interface for the InvoiceDialog component
 * 
 * @property agreementId - ID of the agreement to generate invoice for
 * @property open - Boolean controlling dialog visibility
 * @property onOpenChange - Callback when dialog open state changes
 */
interface InvoiceDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for displaying, printing, and downloading invoices
 */
export const InvoiceDialog = ({ agreementId, open, onOpenChange }: InvoiceDialogProps) => {
  // State to track PDF generation status
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ----- Section: Data Fetching -----
  // Fetch invoice data for the agreement
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice", agreementId],
    queryFn: () => generateInvoiceData(agreementId),
    enabled: open,
  });

  // ----- Section: PDF Generation -----
  // Mutation for generating and downloading PDF version of invoice
  const generatePdfMutation = useMutation({
    mutationFn: async (htmlContent: string) => {
      setIsGeneratingPdf(true);
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { agreementId, htmlContent }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Invoice downloaded successfully');
    },
    onError: (error) => {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    },
    onSettled: () => {
      setIsGeneratingPdf(false);
    }
  });

  /**
   * Handles download button click to generate and download PDF
   */
  const handleDownload = async () => {
    if (!invoiceData) return;
    
    // Get the HTML content of the invoice
    const invoiceElement = document.getElementById('invoice-content');
    if (!invoiceElement) {
      toast.error('Could not generate PDF');
      return;
    }

    // Generate PDF
    generatePdfMutation.mutate(invoiceElement.innerHTML);
  };

  /**
   * Handles print button click to print the invoice
   */
  const handlePrint = () => {
    window.print();
  };

  // ----- Section: Invoice Dialog UI -----
  return (
    <PrintSettingsProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span>Review and download the invoice for this agreement</span>
              <div className="flex gap-2">
                {/* Print button */}
                <PrintButton 
                  contentId="invoice-content"
                  buttonText="Print"
                  variant="outline"
                />
                
                {/* Download PDF button */}
                <Button
                  onClick={handleDownload}
                  disabled={isLoading || isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          {/* ----- Section: Invoice Content ----- */}
          {isLoading ? (
            // Loading state
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : invoiceData ? (
            // Invoice content
            <div className="flex-1 overflow-hidden">
              <div id="invoice-content" className="printable-content">
                <InvoiceView data={invoiceData} onPrint={handlePrint} />
              </div>
            </div>
          ) : (
            // Error state
            <div className="text-center py-8 text-gray-500">
              Failed to load invoice data
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PrintSettingsProvider>
  );
};
