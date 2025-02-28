
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckSquare,
  ChevronDown,
  Trash2,
  FileText,
  Send,
  FileDown,
  CheckCheck
} from "lucide-react";
import { Agreement } from "../hooks/useAgreements";
import { toast } from "sonner";

interface BulkOperationsProps {
  selectedAgreements: Agreement[];
  onClearSelection: () => void;
  onDeleteSelected: (agreements: Agreement[]) => void;
  onExportSelected?: (agreements: Agreement[], format: string) => void;
}

export const BulkOperations = ({ 
  selectedAgreements, 
  onClearSelection,
  onDeleteSelected,
  onExportSelected 
}: BulkOperationsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleDeleteConfirm = () => {
    onDeleteSelected(selectedAgreements);
    setDeleteDialogOpen(false);
    toast.success(`${selectedAgreements.length} agreements deleted`);
  };

  const handleExport = (format: string) => {
    if (onExportSelected) {
      onExportSelected(selectedAgreements, format);
      toast.success(`Exporting ${selectedAgreements.length} agreements as ${format.toUpperCase()}`);
    } else {
      toast.info("Export functionality coming soon");
    }
  };

  if (selectedAgreements.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4 bg-muted/40 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{selectedAgreements.length} selected</span>
        </div>
        
        <div className="flex-1"></div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-xs h-8"
        >
          Clear
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1">
              Actions <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileDown className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.info("Email sharing coming soon");
              }}>
                <Send className="mr-2 h-4 w-4" />
                <span>Share via Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.success("All selected agreements marked as read");
              }}>
                <CheckCheck className="mr-2 h-4 w-4" />
                <span>Mark as Read</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agreements</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAgreements.length} agreements? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
