
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Agreement, useAgreements } from "@/components/agreements/hooks/useAgreements";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceDialog } from "@/components/agreements/InvoiceDialog";
import { PaymentHistoryDialog } from "@/components/agreements/PaymentHistoryDialog";
import { DeleteAgreementDialog } from "@/components/agreements/DeleteAgreementDialog";
import { formatCurrency } from "@/lib/utils";
import { FileText, Trash2, Printer, Clock, Download, Eye } from "lucide-react";
import { ViewSwitcher } from "@/components/maintenance/ViewSwitcher";

interface HeaderlessAgreementListProps {
  searchQuery?: string;
  onViewDetails?: (agreement: Agreement) => void;
  initialView?: 'grid' | 'table';
}

export const HeaderlessAgreementList = ({
  searchQuery = "",
  onViewDetails,
  initialView = "table"
}: HeaderlessAgreementListProps) => {
  const [view, setView] = useState<'grid' | 'table'>(initialView);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showPaymentHistoryDialog, setShowPaymentHistoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const queryClient = useQueryClient();
  const itemsPerPage = 10;
  
  // Use the existing hook to fetch agreements
  const { data: agreements = [], isLoading, error } = useAgreements(searchQuery);
  
  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(agreements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgreements = agreements.slice(startIndex, endIndex);

  const handleViewClick = (agreement: Agreement) => {
    if (onViewDetails) {
      onViewDetails(agreement);
    } else {
      setSelectedAgreement(agreement);
      // Here you could implement a default view details behavior
      toast.info(`Viewed agreement ${agreement.agreement_number || 'N/A'}`);
    }
  };

  const handleInvoiceClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setShowInvoiceDialog(true);
  };

  const handlePaymentHistoryClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setShowPaymentHistoryDialog(true);
  };

  const handleDeleteClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAgreement) return;
    
    setIsDeleting(true);
    
    setTimeout(() => {
      // Invalidate queries to refresh data after deletion
      queryClient.invalidateQueries({ queryKey: ["agreements"] });
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success("Agreement deleted successfully");
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agreements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error loading agreements</p>
        <p className="text-sm mt-1">{String(error)}</p>
      </div>
    );
  }

  if (agreements.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No agreements found</h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery ? `No results found for "${searchQuery}"` : "There are no agreements created yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ViewSwitcher view={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <Table className="border rounded-md">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[180px]">Agreement #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAgreements.map((agreement) => (
              <TableRow key={agreement.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{agreement.agreement_number || 'N/A'}</TableCell>
                <TableCell>{agreement.customer?.full_name || 'Unknown'}</TableCell>
                <TableCell>
                  {agreement.vehicle 
                    ? `${agreement.vehicle.make} ${agreement.vehicle.model} ${agreement.vehicle.year}` 
                    : 'Unknown'}
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {agreement.status}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
                <TableCell>{new Date(agreement.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewClick(agreement)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInvoiceClick(agreement)}
                      title="View invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePaymentHistoryClick(agreement)}
                      title="Payment history"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(agreement)}
                      title="Delete"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentAgreements.map((agreement) => (
            <div 
              key={agreement.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{agreement.agreement_number || 'N/A'}</h3>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {agreement.status}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-medium">Customer:</span> {agreement.customer?.full_name || 'Unknown'}</p>
                <p className="text-sm">
                  <span className="font-medium">Vehicle:</span> {
                    agreement.vehicle 
                      ? `${agreement.vehicle.make} ${agreement.vehicle.model} ${agreement.vehicle.year}` 
                      : 'Unknown'
                  }
                </p>
                <p className="text-sm"><span className="font-medium">Amount:</span> {formatCurrency(agreement.total_amount)}</p>
                <p className="text-sm"><span className="font-medium">Date:</span> {new Date(agreement.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewClick(agreement)}
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInvoiceClick(agreement)}
                  title="View invoice"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePaymentHistoryClick(agreement)}
                  title="Payment history"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(agreement)}
                  title="Delete"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogs */}
      {selectedAgreement && (
        <>
          <InvoiceDialog
            agreementId={selectedAgreement.id}
            open={showInvoiceDialog}
            onOpenChange={setShowInvoiceDialog}
          />
          
          <PaymentHistoryDialog
            agreementId={selectedAgreement.id}
            open={showPaymentHistoryDialog}
            onOpenChange={setShowPaymentHistoryDialog}
          />
          
          <DeleteAgreementDialog
            agreementId={selectedAgreement.id}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onDeleted={() => {
              queryClient.invalidateQueries({ queryKey: ["agreements"] });
            }}
          />
        </>
      )}
    </div>
  );
};
