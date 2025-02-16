
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LeadScore } from "@/types/sales.types";
import { Loader2 } from "lucide-react";

export const LeadScoring = () => {
  const { data: leads, isLoading } = useQuery({
    queryKey: ["lead-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select(`
          id,
          lead_score,
          full_name,
          status,
          customer:customer_id (
            full_name
          )
        `)
        .order("lead_score", { ascending: false });

      if (error) {
        console.error("Error fetching lead scores:", error);
        throw error;
      }

      return data as LeadScore[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leads?.map((lead) => (
        <Card key={lead.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{lead.full_name}</CardTitle>
            <CardDescription>Score: {lead.lead_score || 0}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={lead.lead_score || 0} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              Status: {lead.status}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
