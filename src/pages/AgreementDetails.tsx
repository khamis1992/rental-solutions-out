
import { useParams } from "react-router-dom";

export default function AgreementDetails() {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Agreement Details</h1>
      <p>Agreement ID: {id}</p>
    </div>
  );
}
