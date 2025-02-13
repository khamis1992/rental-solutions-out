
import { Button } from "@/components/ui/button";
import { 
  Upload,
  Download,
  Plus,
  FileText,
  ArrowUpRight
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
              <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                CSV
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export data as CSV</p>
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
                className="bg-blue-600 hover:bg-blue-700 text-white h-11 gap-2 group"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Agreement
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Button>
            </CreateAgreementDialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create new agreement (⌘ N)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 bg-white hover:bg-gray-50 transition-all duration-300"
            >
              <FileText className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Templates</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
