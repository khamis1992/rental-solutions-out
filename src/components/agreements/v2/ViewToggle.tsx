
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList, LayoutDashboard } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list" | "compact";
  onChange: (mode: "grid" | "list" | "compact") => void;
}

export const ViewToggle = ({ viewMode, onChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 border rounded-md">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("grid")}
        className="h-9 px-3 rounded-none rounded-l-md"
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("list")}
        className="h-9 px-3 rounded-none"
        aria-label="List view"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "compact" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("compact")}
        className="h-9 px-3 rounded-none rounded-r-md"
        aria-label="Compact view"
      >
        <LayoutDashboard className="h-4 w-4" />
      </Button>
    </div>
  );
};
