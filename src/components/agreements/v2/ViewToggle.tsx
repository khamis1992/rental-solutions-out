
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Grid, List } from "lucide-react";

interface ViewToggleProps {
  viewMode?: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
  onSearchFocus?: () => void;
  initialMode?: "grid" | "list";
}

export const ViewToggle = ({
  viewMode: externalViewMode,
  onChange,
  onSearchFocus,
  initialMode = "grid"
}: ViewToggleProps) => {
  const [internalViewMode, setInternalViewMode] = useState<"grid" | "list">(initialMode);
  
  // Sync with external viewMode if provided
  useEffect(() => {
    if (externalViewMode) {
      setInternalViewMode(externalViewMode);
    }
  }, [externalViewMode]);
  
  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list") => {
    setInternalViewMode(mode);
    onChange(mode);
  };
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-px border rounded-md shadow-sm bg-background/95 backdrop-blur-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={internalViewMode === "grid" ? "default" : "ghost"} 
              size="sm" 
              className={`p-2 ${internalViewMode === "grid" 
                ? "bg-[#2D2942] hover:bg-[#2D2942]/90 text-white" 
                : "text-[#2D2942]/70 hover:text-[#2D2942] hover:bg-[#2D2942]/5"}`}
              onClick={() => handleViewModeChange("grid")}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#2D2942] text-white border-[#2D2942]/20">
            <div className="text-xs">Grid view</div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={internalViewMode === "list" ? "default" : "ghost"} 
              size="sm" 
              className={`p-2 ${internalViewMode === "list" 
                ? "bg-[#2D2942] hover:bg-[#2D2942]/90 text-white" 
                : "text-[#2D2942]/70 hover:text-[#2D2942] hover:bg-[#2D2942]/5"}`}
              onClick={() => handleViewModeChange("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#2D2942] text-white border-[#2D2942]/20">
            <div className="text-xs">List view</div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
