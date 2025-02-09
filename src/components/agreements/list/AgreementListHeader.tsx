
import { Button } from "@/components/ui/button";
import { FilePlus2, Upload, Trash2, Search, Filter, Download, ArrowUpDown } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

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
      <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
        Agreements
        <span className="text-sm font-normal bg-white/20 px-2 py-1 rounded-full">
          Management Portal
        </span>
      </h1>
      <div className="flex items-center gap-2">
        {/* Search & Filter Group */}
        <div className="flex items-center gap-2 mr-4">
          <Tooltip content="Search agreements (⌘ K)">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2 group"
            >
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Search
            </Button>
          </Tooltip>
          <Tooltip content="Filter view">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2 group"
            >
              <Filter className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Filter
            </Button>
          </Tooltip>
          <Tooltip content="Sort agreements">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all group"
            >
              <ArrowUpDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          </Tooltip>
        </div>

        {/* Import/Export Group */}
        <div className="flex items-center gap-2 mr-4">
          <Tooltip content="Import agreements">
            <Button
              variant="outline"
              size="sm"
              onClick={onImportClick}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2 group"
            >
              <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
              Import
            </Button>
          </Tooltip>
          <Tooltip content="Export data">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all gap-2 group"
            >
              <Download className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
              Export
            </Button>
          </Tooltip>
        </div>

        {/* Action Buttons */}
        <Tooltip content="Delete selected">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteClick}
            disabled={isDeleting}
            className="gap-2 transition-all hover:bg-destructive/90 group"
          >
            <Trash2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Delete
          </Button>
        </Tooltip>
        <Tooltip content="Create new agreement (⌘ N)">
          <Button 
            variant="default"
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105 shadow-lg group"
          >
            <FilePlus2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Create Agreement
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
