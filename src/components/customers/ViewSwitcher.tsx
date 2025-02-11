
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
  view: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
}

export const ViewSwitcher = ({ view, onViewChange }: ViewSwitcherProps) => {
  return (
    <div className="flex items-center gap-2 p-1.5 bg-background/50 rounded-lg border shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "gap-2 hover:bg-background/80",
          view === "grid" && "bg-background shadow-sm"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("table")}
        className={cn(
          "gap-2 hover:bg-background/80",
          view === "table" && "bg-background shadow-sm"
        )}
      >
        <LayoutList className="h-4 w-4" />
        List
      </Button>
    </div>
  );
};
