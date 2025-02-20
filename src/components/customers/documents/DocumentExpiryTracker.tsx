
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle } from "lucide-react";

interface DocumentExpiryTrackerProps {
  documentType: string;
  expiryDate?: Date | null;
  onExpiryDateChange?: (date: Date | null) => void;
  verificationStatus: 'pending' | 'verified' | 'expired' | 'rejected';
}

export function DocumentExpiryTracker({
  documentType,
  expiryDate,
  onExpiryDateChange,
  verificationStatus
}: DocumentExpiryTrackerProps) {
  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {documentType} Expiry Date
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        <DateInput
          value={expiryDate ? format(expiryDate, 'dd/MM/yyyy') : ''}
          onDateChange={onExpiryDateChange}
          label="Expiry Date"
        />
      </CardContent>
    </Card>
  );
}
