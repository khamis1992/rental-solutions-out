
import { Button } from "@/components/ui/button";
import { FilePlus2, Upload, Trash2 } from "lucide-react";

interface AgreementListHeaderProps {
  onImportClick: () => void;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export const AgreementListHeader = ({ 
  onImportClick, 
  onDeleteClick, 
  isDeleting 
}: AgreementListHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      <h1 className="text-3xl font-bold tracking-tight">Agreements</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImportClick}
          className="gap-2 transition-all hover:bg-secondary/80"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="gap-2 transition-all hover:bg-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button 
          variant="default"
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105"
        >
          <FilePlus2 className="h-4 w-4" />
          Create Agreement
        </Button>
      </div>
    </div>
  );
};
