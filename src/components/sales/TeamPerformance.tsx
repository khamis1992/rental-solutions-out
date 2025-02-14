
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Target, Trophy, TrendingUp, Users } from "lucide-react";

interface TeamMember {
  id: string;
  user: {
    full_name: string;
  };
  role: string;
  targets: {
    leads: number;
    conversions: number;
    revenue: number;
  };
}

interface PerformanceMetric {
  team_member_id: string;
  metric_type: string;
  value: number;
  period_start: string;
  period_end: string;
}

export const TeamPerformance = () => {
  // Fetch team members and their performance metrics
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ["sales-team"],
    queryFn: async () => {
      const { data: teamMembers, error: teamError } = await supabase
        .from("sales_team_members")
        .select(`
          id,
          user:user_id ( full_name ),
          role,
          targets
        `);

      if (teamError) throw teamError;

      const { data: metrics, error: metricsError } = await supabase
        .from("sales_performance_metrics")
        .select("*")
        .gte("period_start", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      if (metricsError) throw metricsError;

      return {
        members: teamMembers as TeamMember[],
        metrics: metrics as PerformanceMetric[]
      };
    }
  });

  if (isTeamLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Calculate performance metrics
  const performanceData = teamData?.members.map(member => {
    const memberMetrics = teamData.metrics.filter(m => m.team_member_id === member.id);
    const leads = memberMetrics.find(m => m.metric_type === 'leads')?.value || 0;
    const conversions = memberMetrics.find(m => m.metric_type === 'conversions')?.value || 0;
    const revenue = memberMetrics.find(m => m.metric_type === 'revenue')?.value || 0;

    return {
      name: member.user.full_name,
      leads,
      conversions,
      revenue: revenue / 1000, // Convert to thousands for better display
      target: member.targets?.leads || 0
    };
  }) || [];

  const totalLeads = performanceData.reduce((sum, item) => sum + item.leads, 0);
  const totalConversions = performanceData.reduce((sum, item) => sum + item.conversions, 0);
  const totalRevenue = performanceData.reduce((sum, item) => sum + (item.revenue * 1000), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              {((totalConversions / totalLeads) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill="#8884d8" />
                <Bar dataKey="conversions" name="Conversions" fill="#82ca9d" />
                <Bar dataKey="revenue" name="Revenue (k)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
