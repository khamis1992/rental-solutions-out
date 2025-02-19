
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PaymentForm } from "@/components/agreements/details/PaymentForm";
import { useAgreementDetails } from "@/components/agreements/hooks/useAgreementDetails";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AgreementDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Only enable the query if we have a valid ID
  const { agreement, isLoading, error } = useAgreementDetails(id || "", !!id);

  // Show payment dialog if URL has showPayment=true
  useEffect(() => {
    if (searchParams.get("showPayment") === "true") {
      setShowPaymentDialog(true);
    }
  }, [searchParams]);

  if (!id) {
    return <div className="container mx-auto py-6">Agreement ID is required</div>;
  }

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        Error loading agreement: {error.message}
      </div>
    );
  }

  if (!agreement) {
    return <div className="container mx-auto py-6">Agreement not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Agreement Details</h1>
      
      {/* Agreement details card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Agreement Number</h3>
            <p>{agreement.agreement_number}</p>
          </div>
          <div>
            <h3 className="font-semibold">Customer</h3>
            <p>{agreement.customer?.full_name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Vehicle</h3>
            <p>{agreement.vehicle?.make} {agreement.vehicle?.model}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className="capitalize">{agreement.status}</p>
          </div>
        </div>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm agreementId={agreement.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
