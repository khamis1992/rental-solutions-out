
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SinglePaymentForm } from "./SinglePaymentForm";
import { BulkPaymentForm } from "./BulkPaymentForm";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onSuccess?: () => void;
  totalInstallments?: number;
}

export function AddPaymentDialog({ 
  open, 
  onOpenChange, 
  contractId,
  onSuccess,
  totalInstallments 
}: AddPaymentDialogProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isNotAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight > 20;
    setShowScrollButton(isNotAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Payment Installment</DialogTitle>
        </DialogHeader>
        <ScrollArea 
          ref={scrollAreaRef}
          className="max-h-[calc(90vh-120px)] px-1"
          onScroll={handleScroll}
        >
          <Tabs defaultValue="single" className="space-y-4">
            <TabsList>
              <TabsTrigger value="single">Single Payment</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
              <SinglePaymentForm 
                contractId={contractId} 
                onSuccess={handleSuccess}
                totalInstallments={totalInstallments}
              />
            </TabsContent>
            <TabsContent value="bulk">
              <BulkPaymentForm 
                contractId={contractId} 
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>
        
        <button
          className={`scroll-down-button ${showScrollButton ? 'visible' : ''}`}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
