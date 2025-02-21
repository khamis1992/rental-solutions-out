
import { useParams } from "react-router-dom";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AgreementPayments() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No agreement ID provided. Please select an agreement first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Process Payment</h1>
        <div className="bg-card rounded-lg border p-6">
          <PaymentForm agreementId={id} />
        </div>
      </div>
    </div>
  );
}
