
import { useEffect } from "react";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { useNavigate } from "react-router-dom";

export default function AgreementCreate() {
  const navigate = useNavigate();

  // Handle dialog close by navigating back to agreements list
  const handleClose = () => {
    navigate("/agreements");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Agreement</h1>
      <CreateAgreementDialog 
        open={true} 
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      />
    </div>
  );
}
