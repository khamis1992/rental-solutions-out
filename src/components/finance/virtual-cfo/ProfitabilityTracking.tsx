
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Agreement } from "@/types/agreement.types";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfitabilityTrackingProps {
  agreements: Agreement[] | null;
  isLoading: boolean;
}

export const ProfitabilityTracking = ({ agreements, isLoading }: ProfitabilityTrackingProps) => {
  const totalMonthlyRevenue = agreements?.reduce((sum, agreement) => sum + (agreement.rent_amount || 0), 0) || 0;
  const totalContractValue = agreements?.reduce((sum, agreement) => sum + (agreement.total_amount || 0), 0) || 0;
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profitability Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div className="p-3">
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue)}</div>
            </div>
            <div className="p-3">
              <div className="text-sm text-muted-foreground">Total Contract Value</div>
              <div className="text-2xl font-bold">{formatCurrency(totalContractValue)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
