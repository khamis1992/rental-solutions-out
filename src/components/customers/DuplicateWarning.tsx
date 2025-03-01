
import { AlertCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DuplicateMatch } from "./utils/duplicateDetection";

interface DuplicateWarningProps {
  duplicates: DuplicateMatch[];
  onDismiss: () => void;
}

export function DuplicateWarning({ duplicates, onDismiss }: DuplicateWarningProps) {
  const navigate = useNavigate();

  const handleDelete = async (duplicateId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', duplicateId);

      if (error) throw error;
      toast.success("Customer deleted successfully");
      onDismiss();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || "Failed to delete customer");
    }
  };

  if (!duplicates.length) return null;

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Potential Duplicate Customer{duplicates.length > 1 ? 's' : ''} Found</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {duplicates.map((duplicate) => (
            <div key={duplicate.id} className="flex items-center justify-between gap-4 text-sm">
              <div>
                <div className="font-medium">{duplicate.full_name}</div>
                <div className="text-muted-foreground">
                  {duplicate.match_reason.join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customers/profile/${duplicate.id}`)}
                >
                  View Profile
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(duplicate.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Continue Anyway
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
