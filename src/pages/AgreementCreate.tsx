
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";

export default function AgreementCreate() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Agreement</h1>
      <CreateAgreementDialog open={true} />
    </div>
  );
}
