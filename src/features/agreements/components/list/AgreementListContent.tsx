
import { Button } from "@/components/ui/button";
import { useAgreements } from "@/features/agreements/hooks/useAgreements";
import { Filter, Search } from "lucide-react";

const AgreementListContent = () => {
  const { data: agreements } = useAgreements();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search agreements..."
            className="pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Display agreements data */}
      <div className="space-y-4">
        {agreements?.map((agreement) => (
          <div key={agreement.id} className="p-4 border rounded-lg">
            <h3>Agreement #{agreement.agreement_number}</h3>
            <p>Customer: {agreement.customer?.full_name}</p>
            <p>Vehicle: {agreement.vehicle?.license_plate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgreementListContent;
