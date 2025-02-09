
import { Button } from "@/components/ui/button";
import { FilePlus2, Upload, Trash2, Search, Filter, Download } from "lucide-react";

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
      <h1 className="text-3xl font-bold tracking-tight text-white">Agreements</h1>
      <div className="flex items-center gap-2">
        {/* Search & Filter Group */}
        <div className="flex items-center gap-2 mr-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Import/Export Group */}
        <div className="flex items-center gap-2 mr-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onImportClick}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Action Buttons */}
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
          className="gap-2 bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <FilePlus2 className="h-4 w-4" />
          Create Agreement
        </Button>
      </div>
    </div>
  );
};
