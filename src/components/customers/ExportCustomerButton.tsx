
import { Button } from "@/components/ui/button";
import { useCustomerExport } from "./hooks/useCustomerExport";
import { Download, Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ExportCustomerButtonProps {
  children: ReactNode;
}

export const ExportCustomerButton = ({ children }: ExportCustomerButtonProps) => {
  const { handleExport } = useCustomerExport();
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const onExport = async () => {
    try {
      setIsExporting(true);
      await handleExport();
      toast({
        title: "Export Successful",
        description: "Customer data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the customer data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div onClick={onExport} className="cursor-pointer">
      {isExporting ? (
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/80 dark:hover:bg-gray-700/80" disabled>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Exporting...
        </Button>
      ) : (
        children
      )}
    </div>
  );
};
