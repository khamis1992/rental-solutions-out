
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

interface AgreementListContentProps {
  agreements: Agreement[];
  onViewAgreement: (id: string) => void;
}

export const AgreementListContent = ({
  agreements,
  onViewAgreement,
}: AgreementListContentProps) => {
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
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onViewAgreement(agreement.id)}
          >
            <TableCell>{agreement.agreement_number}</TableCell>
            <TableCell>{agreement.customer?.full_name}</TableCell>
            <TableCell>
              {agreement.vehicle?.make} {agreement.vehicle?.model} (
              {agreement.vehicle?.license_plate})
            </TableCell>
            <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
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
              >
                {agreement.status}
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
              >
                {agreement.payment_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
