
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect, useRef } from "react";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
// Import Lucide icons correctly as React components
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
    onChange("grid");
    toast.success("Grid view activated");
  }, {
    preventDefault: true
  });
  useHotkeys('shift+l', () => {
    onChange("list");
    toast.success("List view activated");
  }, {
    preventDefault: true
  });
  useHotkeys('shift+t', () => {
    onChange("compact");
    toast.success("Compact view activated");
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
        onChange("list");
      } else if (viewMode === "list") {
        onChange("compact");
      } else {
        onChange("grid");
      }
    },
    onSwipeRight: () => {
      // Cycle backward through views: grid -> compact -> list -> grid
      if (viewMode === "grid") {
        onChange("compact");
      } else if (viewMode === "compact") {
        onChange("list");
      } else {
        onChange("grid");
      }
    }
  });

  // Handle view change
  const handleViewChange = (mode: "grid" | "list" | "compact") => {
    setPreviousMode(viewMode);
    onChange(mode);
  };

  return (
    <TooltipProvider>
      <div ref={containerRef} className="flex items-center gap-1 border rounded-md shadow-sm bg-background">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="p-2"
              onClick={() => handleViewChange("grid")}
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
