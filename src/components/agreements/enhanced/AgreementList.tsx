
import { Agreement } from "@/types/agreement.types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  User,
  BadgeCheck,
  Car,
  Eye,
  Trash2,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
  viewMode = "grid",
}: EnhancedAgreementListProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-500/15 text-emerald-700",
          icon: CheckCircle2,
          label: "Active",
          gradient: "from-emerald-50 to-emerald-100/50",
        };
      case "pending":
        return {
          color: "bg-amber-500/15 text-amber-700",
          icon: Clock,
          label: "Pending",
          gradient: "from-amber-50 to-amber-100/50",
        };
      case "overdue":
        return {
          color: "bg-rose-500/15 text-rose-700",
          icon: AlertTriangle,
          label: "Overdue",
          gradient: "from-rose-50 to-rose-100/50",
        };
      default:
        return {
          color: "bg-slate-500/15 text-slate-700",
          icon: FileText,
          label: status,
          gradient: "from-slate-50 to-slate-100/50",
        };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: ArrowUpRight,
          iconColor: "text-emerald-600",
        };
      case "partially_paid":
        return {
          color: "text-amber-700 bg-amber-50 border-amber-200",
          icon: Timer,
          iconColor: "text-amber-600",
        };
      case "unpaid":
        return {
          color: "text-rose-700 bg-rose-50 border-rose-200",
          icon: ArrowDownRight,
          iconColor: "text-rose-600",
        };
      default:
        return {
          color: "text-slate-700 bg-slate-50 border-slate-200",
          icon: CreditCard,
          iconColor: "text-slate-600",
        };
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {agreements.map((agreement) => {
        const status = getStatusConfig(agreement.status);
        const StatusIcon = status.icon;
        const paymentStatus = getPaymentStatusConfig(agreement.payment_status || "unpaid");
        const PaymentIcon = paymentStatus.icon;

        return (
          <Card
            key={agreement.id}
            className={cn(
              "group overflow-hidden transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-1",
              "border border-slate-200/75",
              "animate-fade-in"
            )}
          >
            <CardHeader className={cn(
              "space-y-4 bg-gradient-to-br",
              status.gradient
            )}>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-slate-600" />
                    <h3 className="font-semibold text-lg text-slate-900">
                      {agreement.agreement_number || "No Agreement Number"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <p className="text-sm text-slate-600">{agreement.customer?.full_name}</p>
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
                <Badge className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  status.color
                )}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(agreement.start_date || new Date())}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                  <span>{formatCurrency(agreement.total_amount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize flex items-center gap-1.5",
                      paymentStatus.color
                    )}
                  >
                    <PaymentIcon className={cn("h-3.5 w-3.5", paymentStatus.iconColor)} />
                    {agreement.payment_status || "Not Set"}
                  </Badge>
                </div>

                {agreement.payment_status === "partially_paid" && (
                  <div className="flex items-center gap-3">
                    <Progress
                      value={
                        ((agreement.total_amount - (agreement.remaining_amounts?.[0]?.remaining_amount || 0)) /
                          agreement.total_amount) *
                        100
                      }
                      className="h-2 flex-1"
                    />
                    <span className="text-xs font-medium text-slate-600">
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
            </CardContent>

            <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100">
              <div className="flex w-full justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(agreement)}
                        className="hover:bg-primary/5 hover:text-primary"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
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
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this agreement</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

