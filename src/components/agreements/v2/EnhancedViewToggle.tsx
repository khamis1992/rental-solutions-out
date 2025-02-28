
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList, LayoutDashboard, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useViewMode } from "@/hooks/use-view-mode";

interface EnhancedViewToggleProps {
  onSearchFocus?: () => void;
  onViewModeChange?: (mode: "grid" | "list" | "compact") => void;
}

export const EnhancedViewToggle = ({ 
  onSearchFocus,
  onViewModeChange 
}: EnhancedViewToggleProps) => {
  const { viewMode, setViewMode } = useViewMode();
  const [previousMode, setPreviousMode] = useState<"grid" | "list" | "compact">(viewMode);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup keyboard shortcuts
  useHotkeys('shift+g', () => {
    handleViewChange("grid");
    toast.success("Grid view activated");
  }, { preventDefault: true });
  
  useHotkeys('shift+l', () => {
    handleViewChange("list");
    toast.success("List view activated");
  }, { preventDefault: true });
  
  useHotkeys('shift+t', () => {
    handleViewChange("compact");
    toast.success("Compact view activated");
  }, { preventDefault: true });
  
  useHotkeys('shift+f', () => {
    if (onSearchFocus) {
      onSearchFocus();
      toast.success("Search focused");
    }
  }, { preventDefault: true });

  // Setup touch gestures for mobile
  useTouchGestures(containerRef, {
    onSwipeLeft: () => {
      // Cycle forward through views: grid -> list -> compact -> grid
      if (viewMode === "grid") handleViewChange("list");
      else if (viewMode === "list") handleViewChange("compact");
      else handleViewChange("grid");
    },
    onSwipeRight: () => {
      // Cycle backward through views: grid -> compact -> list -> grid
      if (viewMode === "grid") handleViewChange("compact");
      else if (viewMode === "compact") handleViewChange("list");
      else handleViewChange("grid");
    },
  });

  // Save previous mode before changing to enable toggling back
  const handleViewChange = (mode: "grid" | "list" | "compact") => {
    setPreviousMode(viewMode);
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Function to handle search button click
  const handleSearchClick = () => {
    if (onSearchFocus) {
      onSearchFocus();
    }
  };

  return (
    <TooltipProvider>
      <div 
        ref={containerRef}
        className="flex items-center gap-1 border rounded-md shadow-sm bg-background"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClick}
              className={`h-9 px-3 rounded-none rounded-l-md transition-all duration-200 ${onSearchFocus ? 'hover:bg-muted' : 'cursor-not-allowed opacity-50'}`}
              aria-label="Focus search"
              disabled={!onSearchFocus}
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              Focus search (Shift+F)
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("grid")}
              className={`h-9 px-3 rounded-none transition-all duration-200 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
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
              onClick={() => handleViewChange("list")}
              className={`h-9 px-3 rounded-none transition-all duration-200 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
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
              onClick={() => handleViewChange("compact")}
              className={`h-9 px-3 rounded-none rounded-r-md transition-all duration-200 ${viewMode === "compact" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              aria-label="Compact view"
            >
              <LayoutDashboard className="h-4 w-4" />
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
