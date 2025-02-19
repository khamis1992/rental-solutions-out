
import { useParams } from "react-router-dom";

export default function AgreementPayments() {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Process Payment</h1>
      <p>Agreement ID: {id}</p>
      {/* Payment form will be added here */}
    </div>
  );
}
