
import { useState, useEffect } from "react";

type ViewMode = "grid" | "list" | "compact";

export function useViewMode(initialMode: ViewMode = "grid") {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Try to get stored preference from localStorage
    const storedMode = localStorage.getItem("agreements-view-mode");
    if (storedMode && (storedMode === "grid" || storedMode === "list" || storedMode === "compact")) {
      return storedMode as ViewMode;
    }
    return initialMode;
  });

  // Save to localStorage whenever viewMode changes
  useEffect(() => {
    localStorage.setItem("agreements-view-mode", viewMode);
  }, [viewMode]);

  return {
    viewMode,
    setViewMode,
    isGridView: viewMode === "grid",
    isListView: viewMode === "list",
    isCompactView: viewMode === "compact",
  };
}
