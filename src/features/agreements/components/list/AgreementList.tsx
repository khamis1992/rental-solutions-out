
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAgreements } from "../../hooks/useAgreements";
import { AgreementListContent } from "./AgreementListContent";
import { Loader2 } from "lucide-react";

export const AgreementList = () => {
  const navigate = useNavigate();
  const { data: agreements, isLoading } = useAgreements();
  const [currentPage] = useState(1);
  const itemsPerPage = 10;

  const handleViewAgreement = (id: string) => {
    navigate(`/agreements/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgreements = agreements?.slice(startIndex, endIndex) || [];

  return (
    <Card className="mt-4">
      <div className="p-4">
        <AgreementListContent
          agreements={paginatedAgreements}
          onViewAgreement={handleViewAgreement}
        />
      </div>
    </Card>
  );
};
