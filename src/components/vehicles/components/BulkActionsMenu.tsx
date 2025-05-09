import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface BulkActionsMenuProps {
  selectedCount: number;
  onDelete: () => void;
}

export const BulkActionsMenu = ({ selectedCount, onDelete }: BulkActionsMenuProps) => {
  return (
    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
      <span className="text-sm text-muted-foreground">
        {selectedCount} items selected
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  );
};