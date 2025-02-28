
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid, List, LayoutPanelTop } from "lucide-react";
import { toast } from "sonner";

interface EnhancedViewToggleProps {
  viewMode: "grid" | "list" | "compact";
  onChange: (mode: "grid" | "list" | "compact") => void;
}

export const EnhancedViewToggle = ({ viewMode, onChange }: EnhancedViewToggleProps) => {
  // Handle view change
  const handleViewChange = (mode: "grid" | "list" | "compact") => {
    if (mode === viewMode) return; // Avoid unnecessary updates
    
    onChange(mode);
    
    // Show toast notification
    toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} view activated`);
    
    // Save to localStorage
    localStorage.setItem("agreements-view-mode", mode);
  };

  return (
    <TooltipProvider>
      <div 
        className="flex items-center gap-1 border rounded-md shadow-sm bg-background"
        role="group"
        aria-label="View options"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="p-2"
              onClick={() => handleViewChange("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              Grid view (Shift+G)
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="p-2"
              onClick={() => handleViewChange("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              List view (Shift+L)
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "compact" ? "default" : "ghost"}
              size="sm"
              className="p-2"
              onClick={() => handleViewChange("compact")}
              aria-label="Compact view"
              aria-pressed={viewMode === "compact"}
            >
              <LayoutPanelTop className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              Compact view (Shift+T)
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
