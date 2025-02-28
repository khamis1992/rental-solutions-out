
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agreement } from "@/types/agreement.types";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface AgreementSummaryProps {
  agreements: Agreement[];
}

export function AgreementSummary({ agreements }: AgreementSummaryProps) {
  // Calculate summary statistics
  const totalAgreements = agreements.length;
  const totalValue = agreements.reduce((sum, agreement) => sum + agreement.total_amount, 0);
  
  // Status breakdown
  const statusCounts = agreements.reduce((acc, agreement) => {
    const status = agreement.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: 
      name === "active" ? "#10b981" : 
      name === "pending_payment" ? "#f59e0b" :
      name === "closed" ? "#ef4444" : "#6b7280"
  }));

  // Payment status breakdown
  const paymentStatusCounts = agreements.reduce((acc, agreement) => {
    const status = agreement.payment_status || "pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentStatusCounts).map(([name, value]) => ({
    name,
    value,
    color: 
      name === "completed" ? "#10b981" : 
      name === "pending" ? "#f59e0b" :
      name === "failed" ? "#ef4444" : 
      name === "partially_paid" ? "#3b82f6" : "#6b7280"
  }));

  // Monthly agreement totals (for bar chart)
  const monthlyData = agreements.reduce((acc, agreement) => {
    if (!agreement.start_date) return acc;
    
    const date = new Date(agreement.start_date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        name: monthYear,
        value: 0,
        count: 0
      };
    }
    
    acc[monthYear].value += agreement.total_amount;
    acc[monthYear].count += 1;
    
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.name.split(' ');
    const [bMonth, bYear] = b.name.split(' ');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (aYear !== bYear) {
      return parseInt(aYear) - parseInt(bYear);
    }
    
    return months.indexOf(aMonth) - months.indexOf(bMonth);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agreement Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-green-50 border-green-100">
            <div className="text-sm font-medium text-green-800">Total Agreements</div>
            <div className="text-2xl font-bold text-green-900">{totalAgreements}</div>
          </div>
          
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
            <div className="text-sm font-medium text-blue-800">Total Value</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalValue)}</div>
          </div>
          
          <div className="p-4 border rounded-lg bg-amber-50 border-amber-100">
            <div className="text-sm font-medium text-amber-800">Average Value</div>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(totalAgreements > 0 ? totalValue / totalAgreements : 0)}
            </div>
          </div>
        </div>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Agreement Status</TabsTrigger>
            <TabsTrigger value="payment">Payment Status</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="payment" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="value" fill="#3b82f6" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
