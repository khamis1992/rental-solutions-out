
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { DuplicateMatch } from "./utils/duplicateDetection";

interface DuplicateWarningProps {
  duplicates: DuplicateMatch[];
  onDismiss: () => void;
}

export function DuplicateWarning({ duplicates, onDismiss }: DuplicateWarningProps) {
  const navigate = useNavigate();

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/customers/profile/${duplicate.id}`)}
              >
                View Profile
              </Button>
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
