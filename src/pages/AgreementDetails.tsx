
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Redirect if no valid ID
  useEffect(() => {
    if (!id || id === "undefined") {
      navigate("/agreements");
      return;
    }
  }, [id, navigate]);

  // Only enable the query if we have a valid ID
  const { agreement, isLoading, error } = useAgreementDetails(id || "", !!id && id !== "undefined");

  // Show payment dialog if URL has showPayment=true
  useEffect(() => {
    if (searchParams.get("showPayment") === "true") {
      setShowPaymentDialog(true);
    }
  }, [searchParams]);

  if (!id || id === "undefined") {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Invalid Agreement</h2>
          <p className="text-gray-600">No agreement ID was provided. Redirecting to agreements list...</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we fetch the agreement details.</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Not Found</h2>
          <p className="text-gray-600">Agreement not found. Please check the agreement ID and try again.</p>
        </Card>
      </div>
    );
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
