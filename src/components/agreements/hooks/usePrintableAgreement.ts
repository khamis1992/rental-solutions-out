
import { useState } from "react";
import { Agreement } from "@/types/agreement.types";
import { containsArabic } from "@/lib/utils";

export const usePrintableAgreement = (agreement?: Agreement) => {
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  
  const isArabic = agreement?.processed_content 
    ? containsArabic(agreement.processed_content) 
    : false;
  
  const openPreview = () => setShowTemplatePreview(true);
  const closePreview = () => setShowTemplatePreview(false);
  
  return {
    showTemplatePreview,
    setShowTemplatePreview,
    openPreview,
    closePreview,
    isArabic,
    processedContent: agreement?.processed_content || ""
  };
};
