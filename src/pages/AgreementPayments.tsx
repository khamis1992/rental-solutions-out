
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StandardizedPaymentSystem } from "@/components/payments/StandardizedPaymentSystem";

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
        <StandardizedPaymentSystem agreementId={id} />
      </div>
    </div>
  );
}
