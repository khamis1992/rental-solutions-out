
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrintButton } from "./PrintButton";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface PrintableAgreementCardProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  content?: string;
  isRtl?: boolean;
}

export const PrintableAgreementCard = ({ 
  children, 
  isOpen, 
  onOpenChange, 
  title = "معاينة النموذج",
  content,
  isRtl = false
}: PrintableAgreementCardProps) => {
  const handlePrint = () => {
    // Add a slight delay to ensure dialog content is fully rendered
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b flex flex-row justify-between items-center">
          <DialogTitle>{title}</DialogTitle>
          <PrintButton onPrint={handlePrint} />
        </DialogHeader>
        <ErrorBoundary>
          <div className="preview-container mx-auto bg-white min-h-[297mm]">
            <div 
              className={cn(
                "a4-page w-full max-w-[210mm] mx-auto bg-white p-8 shadow-md",
                isRtl ? "dir-rtl" : ""
              )}
              dir={isRtl ? "rtl" : "ltr"}
            >
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : children}
            </div>
          </div>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
