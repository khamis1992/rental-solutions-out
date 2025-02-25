
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomWordTemplateUpload } from "./CustomWordTemplateUpload";

interface UploadWordTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadWordTemplateDialog = ({
  open,
  onOpenChange
}: UploadWordTemplateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Word Template</DialogTitle>
        </DialogHeader>
        <CustomWordTemplateUpload />
      </DialogContent>
    </Dialog>
  );
};
