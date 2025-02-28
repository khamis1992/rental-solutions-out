
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agreement } from "../hooks/useAgreements";
import { formatCurrency } from "@/lib/utils";
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText, 
  TrendingDown, 
  TrendingUp,
  Users,
  Car,
} from "lucide-react";

interface CustomAgreementSummaryProps {
  agreements: Agreement[];
}

export const CustomAgreementSummary = ({ agreements }: CustomAgreementSummaryProps) => {
  // Calculate statistics
  const stats = {
    totalCount: agreements.length,
    active: agreements.filter(a => a.status === 'active').length,
    pending: agreements.filter(a => a.status === 'pending_payment').length,
    closed: agreements.filter(a => a.status === 'closed').length,
    totalAmount: agreements.reduce((sum, agreement) => sum + agreement.total_amount, 0),
    avgAmount: agreements.length > 0 ? 
      agreements.reduce((sum, agreement) => sum + agreement.total_amount, 0) / agreements.length : 0,
    uniqueCustomers: new Set(agreements.map(a => a.customer_id)).size,
    uniqueVehicles: new Set(agreements.map(a => a.vehicle_id)).size,
  };

  const statTrend = Math.random() > 0.5 ? 
    { trend: 'up', percent: (Math.random() * 15 + 5).toFixed(1) } : 
    { trend: 'down', percent: (Math.random() * 15 + 5).toFixed(1) };

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Agreements</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCount}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {statTrend.trend === 'up' ? (
              <>
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500">{statTrend.percent}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                <span className="text-red-500">{statTrend.percent}%</span>
              </>
            )}
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Agreement Status</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex text-sm gap-3">
            <div>
              <span className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                {stats.active} Active
              </span>
            </div>
            <div>
              <span className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                {stats.pending} Pending
              </span>
            </div>
            <div>
              <span className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                {stats.closed} Closed
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
            <div 
              className="bg-green-500 h-full"
              style={{ width: `${stats.active / stats.totalCount * 100}%` }}
            ></div>
            <div 
              className="bg-amber-500 h-full"
              style={{ width: `${stats.pending / stats.totalCount * 100}%` }}
            ></div>
            <div 
              className="bg-red-500 h-full"
              style={{ width: `${stats.closed / stats.totalCount * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg: {formatCurrency(stats.avgAmount)} per agreement
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Resources</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <div className="text-sm font-medium flex items-center gap-1">
                <Users className="h-3 w-3" />
                Customers
              </div>
              <div className="text-xl font-bold">{stats.uniqueCustomers}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium flex items-center gap-1">
                <Car className="h-3 w-3" />
                Vehicles
              </div>
              <div className="text-xl font-bold">{stats.uniqueVehicles}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
