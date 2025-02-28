
import { Grid2X2, List } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface ViewToggleProps {
  initialMode?: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const ViewToggle = ({ initialMode = "grid", onViewModeChange }: ViewToggleProps) => {
  const [isGridView, setIsGridView] = useState(initialMode === "grid");

  useEffect(() => {
    setIsGridView(initialMode === "grid");
  }, [initialMode]);

  const handleToggleChange = (checked: boolean) => {
    const newMode = checked ? "grid" : "list";
    setIsGridView(checked);
    onViewModeChange(newMode);
  };

  return (
    <div className="flex items-center space-x-3 bg-white rounded-lg p-2 border shadow-sm">
      <List className={`h-5 w-5 ${!isGridView ? "text-blue-600" : "text-gray-400"}`} />
      <Switch 
        checked={isGridView}
        onCheckedChange={handleToggleChange}
      />
      <Grid2X2 className={`h-5 w-5 ${isGridView ? "text-blue-600" : "text-gray-400"}`} />
    </div>
  );
};
