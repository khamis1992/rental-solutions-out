
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PrintableAgreementCard } from "./PrintableAgreementCard";
import { usePrintableAgreement } from "../hooks/usePrintableAgreement";
import { Agreement } from "@/types/agreement.types";

interface PrintableAgreementExampleProps {
  agreement: Agreement;
}

export const PrintableAgreementExample = ({ agreement }: PrintableAgreementExampleProps) => {
  const { 
    showTemplatePreview, 
    setShowTemplatePreview, 
    isArabic, 
    processedContent 
  } = usePrintableAgreement(agreement);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowTemplatePreview(true)}
      >
        <Eye className="h-4 w-4" />
        معاينة
      </Button>

      <PrintableAgreementCard
        isOpen={showTemplatePreview}
        onOpenChange={setShowTemplatePreview}
        content={processedContent}
        isRtl={isArabic}
      />
    </>
  );
};
