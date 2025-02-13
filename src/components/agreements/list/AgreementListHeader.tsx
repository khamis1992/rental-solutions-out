
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
    <div className="flex items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md h-11"
            >
              <Download className="h-5 w-5 group-hover:translate-y-[2px] transition-transform duration-300" />
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
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white h-11"
              >
                <Upload className="h-5 w-5 mr-2" />
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
  );
};
