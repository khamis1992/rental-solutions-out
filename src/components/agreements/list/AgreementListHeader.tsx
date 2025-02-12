
import { Button } from "@/components/ui/button";
import { 
  ChevronDown,
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
        {/* Create Agreement Button with Enhanced Styling */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2 transition-all duration-300 hover:scale-105 shadow-md group"
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
