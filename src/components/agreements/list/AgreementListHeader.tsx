
import { Button } from "@/components/ui/button";
import { 
  Upload,
  Download,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";

interface AgreementListHeaderProps {
  onImportClick: () => void;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export const AgreementListHeader = ({ 
  onImportClick, 
  onDeleteClick, 
  isDeleting 
}: AgreementListHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      <div className="flex items-center gap-3 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4 group-hover:translate-y-[2px] transition-transform duration-300" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CreateAgreementDialog>
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Create Agreement
                </Button>
              </CreateAgreementDialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create new agreement (⌘ N)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
