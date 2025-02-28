
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnhancedCustomerProfile } from "./profile/EnhancedCustomerProfile";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerDetailsDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsDialog = ({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) => {
  const isMobile = useIsMobile();
  
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'w-[95vw] max-w-full p-4' : 'max-w-4xl'} max-h-[90vh] overflow-y-auto momentum-scroll`}
      >
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
        </DialogHeader>
        <EnhancedCustomerProfile customerId={customerId} />
      </DialogContent>
    </Dialog>
  );
};
