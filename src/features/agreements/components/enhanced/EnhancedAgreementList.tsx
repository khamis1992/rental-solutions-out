import { Agreement } from "@/types/agreement.types";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EnhancedAgreementListProps {
  agreements: Agreement[];
  onViewDetails: (agreement: Agreement) => void;
  onDelete: (agreement: Agreement) => void;
  viewMode?: "list" | "grid";
}

export const EnhancedAgreementList = ({
  agreements,
  onViewDetails,
  onDelete,
  viewMode = "list",
}: EnhancedAgreementListProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-500/15 text-emerald-700",
          icon: CheckCircle2,
          label: "Active",
        };
      case "pending":
        return {
          color: "bg-amber-500/15 text-amber-700",
          icon: Clock,
          label: "Pending",
        };
      case "overdue":
        return {
          color: "bg-rose-500/15 text-rose-700",
          icon: AlertTriangle,
          label: "Overdue",
        };
      default:
        return {
          color: "bg-slate-500/15 text-slate-700",
          icon: FileText,
          label: status,
        };
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "partially_paid":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "unpaid":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agreements.map((agreement) => {
          const status = getStatusConfig(agreement.status);
          const StatusIcon = status.icon;

          return (
            <Card
              key={agreement.id}
              className="p-4 space-y-4 hover:shadow-md transition-shadow animate-fade-in"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">
                    {agreement.agreement_number || "No Agreement Number"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {agreement.customer?.full_name}
                  </p>
                </div>
                <Badge className={cn("flex items-center gap-1", status.color)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(agreement.start_date || new Date())}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatCurrency(agreement.total_amount)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(agreement)}
                >
                  View Details
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(agreement)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-md border animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.map((agreement) => {
            const status = getStatusConfig(agreement.status);
            const StatusIcon = status.icon;
            const paymentStatusStyle = getPaymentStatusStyle(
              agreement.payment_status || "unpaid"
            );

            return (
              <TableRow
                key={agreement.id}
                className="group hover:bg-muted/50 animate-fade-in"
              >
                <TableCell className="font-medium">
                  {agreement.agreement_number || "No Agreement Number"}
                </TableCell>
                <TableCell>{agreement.customer?.full_name}</TableCell>
                <TableCell>
                  <Badge className={cn("flex items-center gap-1", status.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(agreement.start_date || new Date())}</TableCell>
                <TableCell>{formatCurrency(agreement.total_amount)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className={cn("capitalize", paymentStatusStyle)}
                    >
                      {agreement.payment_status || "Not Set"}
                    </Badge>
                    {agreement.payment_status === "partially_paid" && (
                      <Progress
                        value={
                          ((agreement.total_amount - (agreement.remaining_amounts?.[0]?.remaining_amount || 0)) /
                            agreement.total_amount) *
                          100
                        }
                        className="h-1.5 w-24"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(agreement)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(agreement)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
