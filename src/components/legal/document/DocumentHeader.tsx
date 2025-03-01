
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PrintButton } from "@/components/print/PrintButton";

interface DocumentHeaderProps {
  customerName?: string;
  onPrint: () => void;
}

export function DocumentHeader({ customerName, onPrint }: DocumentHeaderProps) {
  return (
    <DialogHeader className="space-y-4">
      <DialogTitle className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Legal Document</span>
            <span className="text-sm text-muted-foreground">{customerName || 'No customer selected'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PrintButton 
                  onBeforePrint={onPrint}
                  contentId="legal-document-content"
                  buttonText="Print"
                  variant="outline"
                  className="hover:bg-primary/10"
                  directPrint={true} // Set to true to print directly
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Print or save as PDF</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default"
                  className="print:hidden"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogTitle>
    </DialogHeader>
  );
}
