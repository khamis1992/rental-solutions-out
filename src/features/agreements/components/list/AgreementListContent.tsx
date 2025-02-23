
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Agreement } from "../../types/agreement.types";
import {
  FileText,
  User,
  Car,
  DollarSign,
  CheckCircle,
  Clock,
  Wallet,
  XCircle,
  AlertCircle,
  Copy,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface AgreementListContentProps {
  agreements: Agreement[];
  onViewAgreement: (id: string) => void;
}

export const AgreementListContent = ({
  agreements,
  onViewAgreement,
}: AgreementListContentProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending_payment":
        return <Clock className="h-4 w-4" />;
      case "pending_deposit":
        return <Wallet className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Agreement #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agreements.map((agreement) => (
          <TableRow
            key={agreement.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onViewAgreement(agreement.id)}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{agreement.agreement_number}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Copy
                      className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(agreement.agreement_number);
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Copy agreement number</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
            <TableCell>
              <HoverCard>
                <HoverCardTrigger className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{agreement.customer?.full_name}</span>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Customer Details</h4>
                    <div className="text-sm">
                      <p>Email: {agreement.customer?.email}</p>
                      <p>Phone: {agreement.customer?.phone_number}</p>
                      <p>Status: {agreement.customer?.status}</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </TableCell>
            <TableCell>
              <HoverCard>
                <HoverCardTrigger className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {agreement.vehicle?.make} {agreement.vehicle?.model}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Vehicle Details</h4>
                    <div className="text-sm">
                      <p>License Plate: {agreement.vehicle?.license_plate}</p>
                      <p>Year: {agreement.vehicle?.year}</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {formatCurrency(agreement.total_amount)}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  agreement.status === "active"
                    ? "active"
                    : agreement.status === "pending_payment"
                    ? "pending_payment"
                    : agreement.status === "pending_deposit"
                    ? "pending_deposit"
                    : "closed"
                }
                className="flex items-center gap-2"
              >
                {getStatusIcon(agreement.status)}
                <span>{agreement.status}</span>
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  agreement.payment_status === "completed"
                    ? "success"
                    : agreement.payment_status === "pending"
                    ? "warning"
                    : "destructive"
                }
                className="flex items-center gap-2"
              >
                {getPaymentStatusIcon(agreement.payment_status)}
                <span>{agreement.payment_status}</span>
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AgreementListContent;
