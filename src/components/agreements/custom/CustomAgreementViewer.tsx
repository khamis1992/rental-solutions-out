
import { useState } from "react";
import { AgreementListHeader } from "../list/AgreementListHeader";
import { CustomAgreementList } from "./CustomAgreementList";
import { Button } from "@/components/ui/button";
import { Grid2x2, List } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CustomAgreementViewer = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const handleImportClick = () => {
    // Import handling logic
  };

  const handleDeleteClick = () => {
    // Delete handling logic
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AgreementListHeader
          onImportClick={handleImportClick}
          onDeleteClick={handleDeleteClick}
          isDeleting={false}
        />
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10"
                >
                  <Grid2x2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grid view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>List view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <CustomAgreementList viewMode={viewMode} />
    </div>
  );
};
