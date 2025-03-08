
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CircleDollarSign, FileCheck, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatsDisplayProps {
  paymentCount: number;
  unassignedCount: number;
  totalAmount: number;
  unassignedAmount: number;
  onReconcile: () => void;
  isReconciling: boolean;
  isLoading?: boolean;
  className?: string;
}

export function StatsDisplay({
  paymentCount,
  unassignedCount,
  totalAmount,
  unassignedAmount,
  onReconcile,
  isReconciling,
  isLoading = false,
  className
}: StatsDisplayProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between">
        <h3 className="text-lg font-medium">Traffic Fine Metrics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReconcile}
          disabled={isReconciling || unassignedCount === 0}
          className="ml-auto"
        >
          {isReconciling ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Reconciling...
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Auto-assign Fines
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <StatsCard
          title="Total Traffic Fines"
          value={paymentCount}
          icon={FileCheck}
          iconClassName="blue"
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Unassigned Fines"
          value={unassignedCount}
          icon={AlertTriangle}
          iconClassName={unassignedCount > 0 ? "orange" : "green"}
          description={
            unassignedCount > 0 
              ? "Pending assignment to agreements" 
              : "All fines are assigned"
          }
          isLoading={isLoading}
        />
        
        <StatsCard
          title="Total Fine Amount"
          value={formatCurrency(totalAmount)}
          icon={CircleDollarSign}
          iconClassName="green"
          description={unassignedAmount > 0 ? `${formatCurrency(unassignedAmount)} unassigned` : undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
