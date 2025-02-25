
import { useState } from "react";
import { useAgreements } from "@/components/agreements/hooks/useAgreements";
import { Agreement } from "@/types/agreement.types";
import { CustomAgreementList } from "./CustomAgreementList";
import { DeleteAgreementDialog } from "@/components/agreements/DeleteAgreementDialog";
import { toast } from "sonner";

export function AgreementList() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const { data: agreements = [], isLoading, refetch } = useAgreements();

  const handleViewDetails = (agreement: Agreement) => {
    // View details logic
  };

  const handleDeleteClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setShowDeleteDialog(true);
  };

  const handleDeleteComplete = () => {
    toast.success("Agreement deleted successfully");
    refetch();
    setShowDeleteDialog(false);
    setSelectedAgreement(null);
  };

  return (
    <div className="space-y-4">
      <CustomAgreementList
        agreements={agreements}
        onViewDetails={handleViewDetails}
        onDelete={handleDeleteClick}
        viewMode="grid"
      />

      {selectedAgreement && (
        <DeleteAgreementDialog
          agreementId={selectedAgreement.id}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDeleted={handleDeleteComplete}
        />
      )}
    </div>
  );
}
