
import { Button } from "@/components/ui/button";
import { Agreement } from "@/types/agreement.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Download, CheckSquare, FileText, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface BulkOperationsProps {
  selectedAgreements: Agreement[];
  onClearSelection: () => void;
  onDeleteSelected: (agreements: Agreement[]) => void;
  onExportSelected: (agreements: Agreement[], format: string) => void;
}

export function BulkOperations({
  selectedAgreements,
  onClearSelection,
  onDeleteSelected,
  onExportSelected
}: BulkOperationsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  if (selectedAgreements.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-100">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-blue-800">
          {selectedAgreements.length} agreement{selectedAgreements.length > 1 ? 's' : ''} selected
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Selected
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExportSelected(selectedAgreements, 'pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportSelected(selectedAgreements, 'csv')}>
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportSelected(selectedAgreements, 'excel')}>
              <FileText className="h-4 w-4 mr-2" />
              Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedAgreements.length} selected {selectedAgreements.length > 1 ? 'agreements' : 'agreement'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDeleteSelected(selectedAgreements);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
