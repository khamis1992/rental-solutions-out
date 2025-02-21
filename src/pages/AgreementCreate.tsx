
import { useEffect } from "react";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AgreementCreate() {
  const navigate = useNavigate();

  // Handle dialog close by navigating back to agreements list
  const handleClose = () => {
    navigate("/agreements");
  };

  return (
    <div className="container mx-auto py-6">
      <CreateAgreementDialog 
        open={true} 
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <Button>Create New Agreement</Button>
      </CreateAgreementDialog>
    </div>
  );
}
