
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
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Agreements
        <span className="text-sm font-normal bg-white/20 px-2 py-1 rounded-full ml-2">
          Management Portal
        </span>
      </h1>
      <div className="flex items-center gap-2">
        {/* Import/Export Group */}
        <div className="flex items-center gap-2 mr-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onImportClick}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2 group"
                >
                  <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
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
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2 group"
                >
                  <Download className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default"
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105 shadow-lg group"
              >
                Create Agreement
                <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
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

