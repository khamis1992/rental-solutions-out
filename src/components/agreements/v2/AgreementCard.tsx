import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AgreementCardProps } from "./types";
import { getStatusConfig, getPaymentConfig, calculatePaymentProgress } from "./utils";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Calendar, DollarSign, Eye, Trash2, User, Car } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
export const AgreementCard = ({
  agreement,
  onViewDetails,
  onDelete
}: AgreementCardProps) => {
  const status = getStatusConfig(agreement.status);
  const paymentConfig = getPaymentConfig(agreement.payment_status || "pending");
  const paymentProgress = calculatePaymentProgress(agreement);
  const StatusIcon = status.icon;
  const PaymentIcon = paymentConfig.icon;
  return <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className={cn("space-y-4 bg-gradient-to-br", status.gradient)}>
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
              <p className="text-sm text-slate-600">
                {agreement.customer?.full_name || "No Customer Name"}
              </p>
            </div>
          </div>
          <Badge className="bg-transparent">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Start Date</span>
            </div>
            <span className="text-sm">
              {agreement.start_date ? new Date(agreement.start_date).toLocaleDateString() : "Not set"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Amount</span>
            </div>
            <span className="text-sm">{formatCurrency(agreement.total_amount)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Payment Progress</span>
            <span className="text-sm text-slate-500">{Math.round(paymentProgress)}%</span>
          </div>
          <Progress value={paymentProgress} className="h-2" />
        </div>

        {agreement.payment_status && <Badge variant="outline" className={cn("flex items-center gap-1.5", paymentConfig.color)}>
            <PaymentIcon className="h-3.5 w-3.5" />
            {paymentConfig.badge}
          </Badge>}
      </CardContent>

      <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(agreement)} className="hover:bg-primary/5 hover:text-primary">
            <Eye className="h-4 w-4 mr-1.5" />
            View Details
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(agreement)} className="hover:bg-destructive/90">
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>;
};