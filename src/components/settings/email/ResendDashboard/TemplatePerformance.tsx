
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";

export const TemplatePerformance = () => {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["template-performance"],
    queryFn: async () => {
      const { data: analytics, error } = await supabase
        .from('template_analytics')
        .select(`
          *,
          email_templates (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return analytics.map(record => ({
        name: record.email_templates?.name || 'Unnamed Template',
        sent: record.total_sent,
        delivered: record.delivered,
        opened: record.opened,
        clicked: record.clicked,
        engagementRate: parseFloat(record.engagement_rate?.toFixed(2)) || 0,
        responseRate: parseFloat(record.response_rate?.toFixed(2)) || 0
      }));
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
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>
            Compare performance metrics across different email templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sent" fill="#8884d8" name="Total Sent" />
                <Bar yAxisId="left" dataKey="delivered" fill="#82ca9d" name="Delivered" />
                <Bar yAxisId="left" dataKey="opened" fill="#ffc658" name="Opened" />
                <Bar yAxisId="left" dataKey="clicked" fill="#ff8042" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rates</CardTitle>
            <CardDescription>
              Open rates for each template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="engagementRate" fill="#8884d8" name="Engagement Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Rates</CardTitle>
            <CardDescription>
              Click-through rates for each template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="responseRate" fill="#82ca9d" name="Response Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
