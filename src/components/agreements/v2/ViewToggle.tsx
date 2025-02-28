
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect, useRef } from "react";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Grid, List, LayoutPanelTop } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list" | "compact";
  onChange: (mode: "grid" | "list" | "compact") => void;
  onSearchFocus?: () => void;
}

export const ViewToggle = ({
  viewMode,
  onChange,
  onSearchFocus
}: ViewToggleProps) => {
  const [previousMode, setPreviousMode] = useState<"grid" | "list" | "compact">(viewMode);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem("agreements-view-mode", viewMode);
  }, [viewMode]);

  // Load preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("agreements-view-mode");
    if (savedMode && (savedMode === "grid" || savedMode === "list" || savedMode === "compact")) {
      if (savedMode !== viewMode) {
        onChange(savedMode as "grid" | "list" | "compact");
      }
    }
  }, [onChange, viewMode]);

  // Setup keyboard shortcuts
  useHotkeys('shift+g', () => {
    handleViewChange("grid");
  }, {
    preventDefault: true
  });

  useHotkeys('shift+l', () => {
    handleViewChange("list");
  }, {
    preventDefault: true
  });

  useHotkeys('shift+t', () => {
    handleViewChange("compact");
  }, {
    preventDefault: true
  });

  useHotkeys('shift+f', () => {
    if (onSearchFocus) {
      onSearchFocus();
      toast.success("Search focused");
    }
  }, {
    preventDefault: true
  });

  // Setup touch gestures for mobile
  useTouchGestures(containerRef, {
    onSwipeLeft: () => {
      // Cycle forward through views: grid -> list -> compact -> grid
      if (viewMode === "grid") {
        handleViewChange("list");
      } else if (viewMode === "list") {
        handleViewChange("compact");
      } else {
        handleViewChange("grid");
      }
    },
    onSwipeRight: () => {
      // Cycle backward through views: grid -> compact -> list -> grid
      if (viewMode === "grid") {
        handleViewChange("compact");
      } else if (viewMode === "compact") {
        handleViewChange("list");
      } else {
        handleViewChange("grid");
      }
    }
  });

  // Handle view change
  const handleViewChange = (mode: "grid" | "list" | "compact") => {
    if (mode === viewMode) return; // Avoid unnecessary updates if mode is the same
    
    setPreviousMode(viewMode);
    onChange(mode);
    
    // Show toast notification
    toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} view activated`);
    
    // Make sure the change is saved to localStorage
    localStorage.setItem("agreements-view-mode", mode);
  };

  return (
    <TooltipProvider>
      <div 
        ref={containerRef} 
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
