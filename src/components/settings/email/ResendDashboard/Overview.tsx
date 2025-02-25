
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, AlertCircle, CheckCircle, LineChart } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";

export const ResendOverview = () => {
  const { data: emailStats, isLoading } = useQuery({
    queryKey: ["email-stats"],
    queryFn: async () => {
      const { data: metrics, error } = await supabase
        .from('email_metrics')
        .select('status, sent_at')
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        total: metrics.length,
        delivered: metrics.filter(m => m.status === 'delivered').length,
        failed: metrics.filter(m => m.status === 'failed').length,
        last7Days: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          return {
            date: format(date, 'MMM dd'),
            sent: metrics.filter(m => 
              format(new Date(m.sent_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            ).length
          };
        }).reverse()
      };

      return stats;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails (24h)</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats?.delivered || 0}</div>
            <p className="text-xs text-muted-foreground">
              {emailStats?.total ? 
                `${Math.round((emailStats.delivered / emailStats.total) * 100)}% delivery rate` : 
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
            <div className="text-2xl font-bold">{emailStats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {emailStats?.total ? 
                `${Math.round((emailStats.failed / emailStats.total) * 100)}% failure rate` : 
                'No emails sent'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Activity</CardTitle>
          <CardDescription>
            Email sending activity over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={emailStats?.last7Days}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#8884d8" 
                  name="Emails Sent"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest email activities in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Activity list will be implemented in the next iteration */}
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
