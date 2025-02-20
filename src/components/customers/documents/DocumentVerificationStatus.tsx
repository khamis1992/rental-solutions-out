
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DocumentPreview } from "./DocumentPreview";

interface DocumentVerificationStatusProps {
  documentType: string;
  documentUrl?: string | null;
  status: 'pending' | 'verified' | 'rejected';
  onVerify?: () => void;
  onReject?: () => void;
}

export function DocumentVerificationStatus({
  documentType,
  documentUrl,
  status,
  onVerify,
  onReject
}: DocumentVerificationStatusProps) {
  const [showPreview, setShowPreview] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Verification
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {documentType} Verification
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documentUrl && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPreview(true)}
              >
                Preview Document
              </Button>

              <DocumentPreview
                fileUrl={documentUrl}
                fileName={`${documentType} Document`}
                open={showPreview}
                onClose={() => setShowPreview(false)}
              />
            </>
          )}

          {status === 'pending' && (
            <div className="flex gap-2">
              {onVerify && (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={onVerify}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              )}
              {onReject && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onReject}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
