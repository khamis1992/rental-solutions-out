
import { Button } from "@/components/ui/button";
import { 
  ChevronDown,
  Download,
  Upload
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        {/* Import/Export Group with Enhanced Styling */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onImportClick}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300 gap-2 group shadow-lg hover:shadow-xl"
              >
                <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform duration-300" />
                Import
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import agreements</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300 gap-2 group shadow-lg hover:shadow-xl"
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

        {/* Create Agreement Button with Enhanced Styling */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white gap-2 transition-all duration-300 hover:scale-105 shadow-lg group backdrop-blur-md border border-white/30"
              >
                Create Agreement
                <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
              </Button>
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

