
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

interface InvoiceDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceDialog = ({ agreementId, open, onOpenChange }: InvoiceDialogProps) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice", agreementId],
    queryFn: () => generateInvoiceData(agreementId),
    enabled: open,
  });

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>Review and download the invoice for this agreement</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                disabled={isLoading || isGeneratingPdf}
              >
                Print
              </Button>
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
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : invoiceData ? (
          <div className="flex-1 overflow-hidden">
            <div id="invoice-content">
              <InvoiceView data={invoiceData} onPrint={handlePrint} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load invoice data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
