
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Car, FileText, CheckCircle, Target, Star, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SalesMetrics {
  activeLeads: number;
  vehicleAssignments: number;
  draftAgreements: number;
  completedSales: number;
  newLeadsThisWeek: number;
  pendingApprovals: number;
  readyForSignature: number;
  highPriorityLeads: number;
  avgLeadScore: number;
  followUpsToday: number;
}

export const SalesOverview = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["sales-metrics"],
    queryFn: async (): Promise<SalesMetrics> => {
      // Get active leads count and new leads from last week
      const { data: activeLeads, error: leadsError } = await supabase
        .from("sales_leads")
        .select("id, created_at, status, priority, lead_score, next_follow_up")
        .not("status", "in", '("completed","cancelled")');

      if (leadsError) throw leadsError;

      // Get vehicle assignments count
      const { data: vehicleAssignments, error: assignmentsError } = await supabase
        .from("sales_vehicle_reservations")
        .select("id")
        .eq("status", "confirmed");

      if (assignmentsError) throw assignmentsError;

      // Get draft agreements count
      const { data: draftAgreements, error: draftsError } = await supabase
        .from("sales_leads")
        .select("id")
        .eq("status", "agreement_draft");

      if (draftsError) throw draftsError;

      // Get completed sales count for this month
      const { data: completedSales, error: completedError } = await supabase
        .from("sales_leads")
        .select("id")
        .eq("status", "completed")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (completedError) throw completedError;

      // Calculate new leads from last week
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const newLeadsThisWeek = activeLeads.filter(
        lead => new Date(lead.created_at) > lastWeek
      ).length;

      // Count leads ready for signature
      const readyForSignature = activeLeads.filter(
        lead => lead.status === "ready_for_signature"
      ).length;

      // Count pending vehicle assignments
      const { data: pendingAssignments, error: pendingError } = await supabase
        .from("sales_vehicle_reservations")
        .select("id")
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      // Calculate new metrics
      const highPriorityLeads = activeLeads.filter(lead => lead.priority === 'A').length;
      const avgLeadScore = activeLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / activeLeads.length || 0;
      
      // Count follow-ups due today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const followUpsToday = activeLeads.filter(
        lead => lead.next_follow_up && 
        new Date(lead.next_follow_up) >= today && 
        new Date(lead.next_follow_up) < tomorrow
      ).length;

      return {
        activeLeads: activeLeads.length,
        vehicleAssignments: vehicleAssignments.length,
        draftAgreements: draftAgreements.length,
        completedSales: completedSales.length,
        newLeadsThisWeek,
        pendingApprovals: pendingAssignments.length,
        readyForSignature,
        highPriorityLeads,
        avgLeadScore,
        followUpsToday
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.activeLeads || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{metrics?.newLeadsThisWeek || 0} from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vehicle Assignments</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.vehicleAssignments || 0}</div>
          <p className="text-xs text-muted-foreground">
            {metrics?.pendingApprovals || 0} pending approval
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draft Agreements</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.draftAgreements || 0}</div>
          <p className="text-xs text-muted-foreground">
            {metrics?.readyForSignature || 0} ready for signature
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.completedSales || 0}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority Leads</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.highPriorityLeads || 0}</div>
          <p className="text-xs text-muted-foreground">Priority A leads</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Lead Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(metrics?.avgLeadScore || 0)}</div>
          <p className="text-xs text-muted-foreground">Overall lead quality</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups Today</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.followUpsToday || 0}</div>
          <p className="text-xs text-muted-foreground">Scheduled follow-ups</p>
        </CardContent>
      </Card>
    </div>
  );
};
