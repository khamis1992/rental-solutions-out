
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { ProcessTemplatesDialog } from "@/components/agreements/ProcessTemplatesDialog";
import { useState } from "react";

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
  const [showProcessTemplates, setShowProcessTemplates] = useState(false);
  
  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white text-[#2D2942] border-[#2D2942]/10 hover:bg-[#2D2942]/5 hover:border-[#2D2942]/20 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md h-10"
              onClick={() => setShowProcessTemplates(true)}
            >
              <FileText className="h-4 w-4 text-[#2D2942]/90" />
              Process Templates
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#2D2942] text-white border-[#2D2942]/20">
            <p>Process agreement templates</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white text-[#2D2942] border-[#2D2942]/10 hover:bg-[#2D2942]/5 hover:border-[#2D2942]/20 transition-all duration-300 gap-2 group shadow-sm hover:shadow-md h-10"
            >
              <Download className="h-4 w-4 text-[#2D2942]/90 group-hover:translate-y-[2px] transition-transform duration-300" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#2D2942] text-white border-[#2D2942]/20">
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
                className="bg-[#2D2942] hover:bg-[#2D2942]/90 text-white h-10 gap-2"
              >
                <Upload className="h-4 w-4" />
                Create Agreement
              </Button>
            </CreateAgreementDialog>
          </TooltipTrigger>
          <TooltipContent className="bg-[#2D2942] text-white border-[#2D2942]/20">
            <p>Create new agreement (⌘ N)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ProcessTemplatesDialog open={showProcessTemplates} onOpenChange={setShowProcessTemplates} />
    </div>
  );
};
