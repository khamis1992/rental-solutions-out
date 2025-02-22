
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface ProcessTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ProcessResult {
  success: boolean;
  agreement_id: string;
  error_message: string | null;
}

export function ProcessTemplatesDialog({
  open,
  onOpenChange,
  onSuccess,
}: ProcessTemplatesDialogProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processTemplates = async () => {
    try {
      setProcessing(true);
      setProgress(10);

      const { data: results, error } = await supabase
        .rpc<ProcessResult>('process_agreement_templates');

      if (error) {
        throw error;
      }

      if (!results || !Array.isArray(results)) {
        throw new Error('No response from template processing');
      }

      setProgress(100);

      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      // Show results
      if (failureCount === 0) {
        toast.success(`Successfully processed ${successCount} agreements`);
      } else {
        toast.warning(
          `Processed ${successCount} agreements successfully, ${failureCount} failed`
        );
      }

      // Call success callback
      onSuccess?.();
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setProgress(0);
      }, 1500);

    } catch (error) {
      console.error("Error processing templates:", error);
      toast.error("Failed to process templates");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Agreement Templates</DialogTitle>
          <DialogDescription>
            This will process all agreements that have templates but no processed content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {processing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Processing templates...
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            onClick={processTemplates}
            disabled={processing}
          >
            Process Templates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
