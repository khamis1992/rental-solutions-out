
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { Users, Globe, Monitor, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  pageViews: { page: string; views: number }[];
  visitorsByCountry: { country: string; visitors: number }[];
  visitorsByDevice: { device: string; visitors: number }[];
  timeSeriesData: { date: string; visitors: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export const VisitorAnalyticsDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['visitor-analytics'],
    queryFn: async () => {
      const { data: visitors, error } = await supabase
        .from('visitor_analytics')
        .select('*')
        .order('visited_at', { ascending: false });

      if (error) throw error;

      // Process the data for visualization
      const uniqueSessions = new Set(visitors?.map(v => v.session_id));
      const totalTimeOnPage = visitors?.reduce((sum, v) => 
        sum + ((v.engagement_metrics?.timeOnPage || 0) / 1000), 0);

      const pageViews = visitors?.reduce((acc, v) => {
        const page = v.page_visited;
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const countryStats = visitors?.reduce((acc, v) => {
        if (v.country) {
          acc[v.country] = (acc[v.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const deviceStats = visitors?.reduce((acc, v) => {
        if (v.device_type) {
          acc[v.device_type] = (acc[v.device_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Create time series data
      const timeSeriesData = visitors?.reduce((acc, v) => {
        const date = new Date(v.visited_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalVisitors: visitors?.length || 0,
        uniqueVisitors: uniqueSessions.size,
        averageTimeOnPage: totalTimeOnPage / (visitors?.length || 1),
        bounceRate: 0, // Implement bounce rate calculation
        pageViews: Object.entries(pageViews || {}).map(([page, views]) => ({
          page,
          views
        })),
        visitorsByCountry: Object.entries(countryStats || {}).map(([country, visitors]) => ({
          country,
          visitors
        })),
        visitorsByDevice: Object.entries(deviceStats || {}).map(([device, visitors]) => ({
          device,
          visitors
        })),
        timeSeriesData: Object.entries(timeSeriesData || {}).map(([date, visitors]) => ({
          date,
          visitors
        }))
      } as VisitorStats;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVisitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uniqueVisitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats?.averageTimeOnPage || 0)}s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Types</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.visitorsByDevice.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitors Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.pageViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visitors by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.visitorsByCountry}
                    dataKey="visitors"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats?.visitorsByCountry.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.visitorsByDevice}
                    dataKey="visitors"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats?.visitorsByDevice.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
