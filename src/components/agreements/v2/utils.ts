
import { Agreement } from "@/types/agreement.types";
import { StatusConfig, PaymentConfig } from "./types";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertTriangle,
  DollarSign,
  XCircle
} from "lucide-react";

export const getStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    active: {
      color: "bg-emerald-500/15 text-emerald-700",
      icon: CheckCircle2,
      label: "Active",
      gradient: "from-emerald-50 to-emerald-100/50",
      description: "Agreement is currently active"
    },
    pending_payment: {
      color: "text-amber-700",
      icon: Clock,
      label: "Pending Payment",
      gradient: "from-white to-white",
      description: "Awaiting payment confirmation"
    },
    closed: {
      color: "bg-rose-500/15 text-rose-700",
      icon: FileText,
      label: "Closed",
      gradient: "from-rose-50 to-rose-100/50",
      description: "Agreement has been closed"
    }
  };

  return configs[status] || configs.pending_payment;
};

export const getPaymentConfig = (status: string): PaymentConfig => {
  const configs: Record<string, PaymentConfig> = {
    completed: {
      color: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
      badge: "Payment Complete",
      description: "Payment has been processed successfully"
    },
    pending: {
      color: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock,
      badge: "Payment Pending",
      description: "Payment is being processed"
    },
    failed: {
      color: "border-rose-200 bg-rose-50 text-rose-700",
      icon: XCircle,
      badge: "Payment Failed",
      description: "Payment transaction failed"
    }
  };

  return configs[status] || configs.pending;
};

export const calculatePaymentProgress = (agreement: Agreement): number => {
  const remainingAmount = agreement.remaining_amounts?.[0]?.remaining_amount || 0;
  const totalAmount = agreement.total_amount;
  
  if (totalAmount === 0) return 0;
  return ((totalAmount - remainingAmount) / totalAmount) * 100;
};
