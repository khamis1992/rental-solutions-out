
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";

export const EmailMetricsDashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['email-metrics'],
    queryFn: async () => {
      const { data: dashboardData } = await supabase
        .from('email_sending_dashboard')
        .select('*')
        .order('time_bucket', { ascending: false })
        .limit(24);

      const { data: currentMetrics } = await supabase
        .from('email_sending_metrics')
        .select('*')
        .order('date_bucket', { ascending: false })
        .limit(1);

      return {
        dashboard: dashboardData || [],
        current: currentMetrics?.[0] || null
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentStats = metrics?.current || {
    total_sent: 0,
    successful_sent: 0,
    failed_sent: 0,
    rate_limited_count: 0
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total_sent}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.successful_sent}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.total_sent ? 
                `${Math.round((currentStats.successful_sent / currentStats.total_sent) * 100)}% success rate` : 
                'No emails sent'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.failed_sent}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.total_sent ? 
                `${Math.round((currentStats.failed_sent / currentStats.total_sent) * 100)}% failure rate` : 
                'No emails sent'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limited</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.rate_limited_count}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Activity</CardTitle>
          <CardDescription>
            Email sending activity over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics?.dashboard}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time_bucket" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()} 
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: any) => [value, 'Count']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  name="Emails Sent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
