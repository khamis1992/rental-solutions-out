
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface ContractPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onClose?: () => void;
}

export const ContractPromptDialog = ({
  open,
  onOpenChange,
  customerId,
  onClose
}: ContractPromptDialogProps) => {
  const navigate = useNavigate();

  const handleCreateAgreement = () => {
    onOpenChange(false);
    onClose?.();
    
    if (customerId) {
      navigate(`/agreements/new?customerId=${customerId}`);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Agreement</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to create a new agreement for this customer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            onOpenChange(false);
            onClose?.();
          }}>
            Skip for now
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleCreateAgreement}>
            Create Agreement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
