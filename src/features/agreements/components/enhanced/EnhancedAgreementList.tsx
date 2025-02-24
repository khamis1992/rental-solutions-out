
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
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Eye,
  Trash2,
  BadgeCheck,
  Shield,
  Car,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          animation: "animate-pulse",
        };
      case "pending":
        return {
          color: "bg-amber-500/15 text-amber-700",
          icon: Clock,
          label: "Pending",
          animation: "animate-spin-slow",
        };
      case "overdue":
        return {
          color: "bg-rose-500/15 text-rose-700",
          icon: AlertTriangle,
          label: "Overdue",
          animation: "animate-bounce",
        };
      default:
        return {
          color: "bg-slate-500/15 text-slate-700",
          icon: FileText,
          label: status,
          animation: "",
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

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <ArrowUpRight className="h-4 w-4 text-emerald-600" />;
      case "partially_paid":
        return <Timer className="h-4 w-4 text-amber-600" />;
      case "unpaid":
        return <ArrowDownRight className="h-4 w-4 text-rose-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-slate-600" />;
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
              className="group p-4 space-y-4 hover:shadow-lg transition-all duration-300 animate-fade-in border-slate-200 hover:border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-500" />
                    <h3 className="font-medium">
                      {agreement.agreement_number || "No Agreement Number"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <p>{agreement.customer?.full_name}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>Verified Customer</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Badge className={cn("flex items-center gap-1", status.color)}>
                  <StatusIcon className={cn("h-3.5 w-3.5", status.animation)} />
                  {status.label}
                </Badge>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{formatDate(agreement.start_date || new Date())}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold">{formatCurrency(agreement.total_amount)}</span>
                  {getPaymentStatusIcon(agreement.payment_status || "unpaid")}
                </div>
                {agreement.payment_status === "partially_paid" && (
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        ((agreement.total_amount - (agreement.remaining_amounts?.[0]?.remaining_amount || 0)) /
                          agreement.total_amount) *
                        100
                      }
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        ((agreement.total_amount - (agreement.remaining_amounts?.[0]?.remaining_amount || 0)) /
                          agreement.total_amount) *
                          100
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(agreement)}
                        className="hover:bg-primary/5 hover:text-primary"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View agreement details</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(agreement)}
                        className="hover:bg-destructive/90"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this agreement</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-md border animate-fade-in border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="font-semibold">Agreement Number</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Start Date</TableHead>
            <TableHead className="font-semibold">Total Amount</TableHead>
            <TableHead className="font-semibold">Payment Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
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
                className="group hover:bg-slate-50/50 animate-fade-in transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-slate-500" />
                    {agreement.agreement_number || "No Agreement Number"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    {agreement.customer?.full_name}
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("flex items-center gap-1", status.color)}>
                    <StatusIcon className={cn("h-3.5 w-3.5", status.animation)} />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {formatDate(agreement.start_date || new Date())}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    {formatCurrency(agreement.total_amount)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className={cn("capitalize flex items-center gap-1", paymentStatusStyle)}
                    >
                      {getPaymentStatusIcon(agreement.payment_status || "unpaid")}
                      {agreement.payment_status || "Not Set"}
                    </Badge>
                    {agreement.payment_status === "partially_paid" && (
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            ((agreement.total_amount - (agreement.remaining_amounts?.[0]?.remaining_amount || 0)) /
                              agreement.total_amount) *
                            100
                          }
                          className="h-1.5 w-24"
                        />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(
                            ((agreement.total_amount - (agreement.remaining_amounts?.[0]?.remaining_amount || 0)) /
                              agreement.total_amount) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(agreement)}
                            className="hover:bg-primary/5 hover:text-primary"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View agreement details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(agreement)}
                            className="hover:bg-destructive/90"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete this agreement</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

